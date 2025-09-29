import { TeacherRepository } from "@/features/repository/Teacher/Teacher.repository"
import { TeacherSchema } from "./Teacher.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace TeacherService {
  export async function create(
    Teacher: Omit<typeof TeacherSchema, "id"| "createdAt" | "updatedAt">
  ) {
    if (!Teacher.name || Teacher.name.trim() === '') {
      throw new Error('Teacher name is required and cannot be empty.');
    }
    try {
      const newTeacher = TeacherRepository.create(Teacher);
      return newTeacher;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Teachername already exists");
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const Teachers = await TeacherRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await TeacherRepository.countAll(search);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: Teachers,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  export async function findById(TeacherId: string) {
    return TeacherRepository.findById(TeacherId);
  }

  export async function update(
    TeacherId: string,
    Teacher: Partial<Pick<typeof TeacherSchema, "name">>
  ) {
    try {
      const data = { ...Teacher };
      return await TeacherRepository.update(TeacherId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Teachername already exists");
      }
      throw error;
    }
  }

  export async function deleteById(TeacherId: string) {
    return TeacherRepository.deleteById(TeacherId);
  }
}
