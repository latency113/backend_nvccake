import prisma from "@/providers/database/database.provider";
import { ClassroomSchema } from "@/features/services/Classroom/Classroom.schema";

export namespace ClassroomRepository {
  export async function create(
    Classroom: Pick<
      typeof ClassroomSchema,
      "name" | "teacher_id" | "department_id" | "gradeLevel_id"
    >
  ) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Classroom.teacher_id },
    });

    const department = await prisma.department.findUnique({
      where: { id: Classroom.department_id },
    });

    if (!teacher) {
      throw new Error(`Teacher with id ${Classroom.teacher_id} not found`);
    }

    if (!department) {
      throw new Error(`Department with id ${Classroom.department_id} not found`);
    }

    return prisma.classroom.create({
      data: {
        ...Classroom,
    }})
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
  }) {
    return prisma.classroom.findMany({
      include: {
        department: true,
        grade_level: true,
        teacher: true,
        teams: true,
        orders: true,
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(ClassroomId: string) {
    return await prisma.classroom.findUnique({
      where: {
        id: ClassroomId,
      },
    });
  }

  export async function update(
    ClassroomId: string,
    Classroom: Partial<
      Pick<
        typeof ClassroomSchema,
        "teacher_id" | "department_id" | "gradeLevel_id"
      >
    >
  ) {
    return prisma.classroom.update({
      where: {
        id: ClassroomId,
      },
      data: {
        ...Classroom,
      },
    });
  }

  export async function deleteById(ClassroomId: string) {
    return prisma.classroom.delete({
      where: {
        id: ClassroomId,
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
    return await prisma.classroom.count({ where });
  }
}
