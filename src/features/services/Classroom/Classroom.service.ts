import { ClassroomRepository } from "@/features/repository/Classroom/Classrom.repository"
import { ClassroomSchema } from "./Classroom.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace ClassroomService {
  export async function create(
    Classroom: Omit<typeof ClassroomSchema, "id">
  ) {
    if (!Classroom.name || Classroom.name.trim() === '') {
      throw new Error('Classroom name is required and cannot be empty.');
    }
    try {
      const newClassroom = ClassroomRepository.create(Classroom);
      return newClassroom;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Classroom name already exists");
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
    const Classrooms = await ClassroomRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await ClassroomRepository.countAll(search);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    // Transform the data to ensure teacher has a classroom array
    const transformedClassrooms = Classrooms.map(classroom => ({
      ...classroom,
      teacher: {
        ...classroom.teacher,
        classroom: [classroom]  // Add this classroom to the teacher's classroom array
      }
    }));

    return {
      data: transformedClassrooms,
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

  export async function findById(ClassroomId: string) {
    return ClassroomRepository.findById(ClassroomId);
  }

  export async function update(
    ClassroomId: string,
    Classroom: Partial<Pick<typeof ClassroomSchema, "name">>
  ) {
    try {
      const data = { ...Classroom };
      return await ClassroomRepository.update(ClassroomId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Classroomname already exists");
      }
      throw error;
    }
  }

  export async function deleteById(ClassroomId: string) {
    return ClassroomRepository.deleteById(ClassroomId);
  }
}
