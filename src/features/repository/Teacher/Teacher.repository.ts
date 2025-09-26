import prisma from "@/providers/database/database.provider";
import { TeacherSchema } from "@/features/services/Teacher/Teacher.schema";

export namespace TeacherRepository {
  export async function create(
    teacher: Pick<typeof TeacherSchema, "name">
  ) {
    return prisma.teacher.create({
      data: {
        ...teacher,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where = options.search
      ? {
          name: {
            contains: options.search,
          },
        }
      : {};

    return prisma.teacher.findMany({
      where,
      include: {
        classroom: {
          include: {grade_level: true }
        }
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(teacherId: string) {
    return await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });
  }

  export async function update(
    teacherId: string,
    teacher: Partial<Pick<typeof TeacherSchema, "name">>
  ) {
    return prisma.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        ...teacher,
      },
    });
  }

  export async function deleteById(teacherId: string) {
    return prisma.teacher.delete({
      where: {
        id: teacherId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};
    return await prisma.teacher.count({ where });
  }
}
