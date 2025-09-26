import prisma from "@/providers/database/database.provider";
import { GradeLevelSchema } from "@/features/services/GradeLevel/GradeLevel.schema";

export namespace GradeLevelRepository {
  export async function create(
    GradeLevel: Pick<typeof GradeLevelSchema, "level" | "year">
  ) {
    return prisma.gradeLevel.create({
      data: {
        ...GradeLevel,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
  }) {
    return prisma.gradeLevel.findMany({
      include: {
        classroom: true,
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(GradeLevelId: string) {
    return await prisma.gradeLevel.findUnique({
      where: {
        id: GradeLevelId,
      },
    });
  }

  export async function update(
    GradeLevelId: string,
    GradeLevel: Partial<Pick<typeof GradeLevelSchema, "level" | "year">>
  ) {
    return prisma.gradeLevel.update({
      where: {
        id: GradeLevelId,
      },
      data: {
        ...GradeLevel,
      },
    });
  }

  export async function deleteById(GradeLevelId: string) {
    return prisma.gradeLevel.delete({
      where: {
        id: GradeLevelId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          findAll: {
            contains: search,
          },
        }
      : {};
    return await prisma.gradeLevel.count({ where });
  }
}
