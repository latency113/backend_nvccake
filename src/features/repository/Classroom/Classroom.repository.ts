import prisma from "@/providers/database/database.provider";
import {
  CreateClassroomDto,
  UpdateClassroomDto,
} from "@/features/services/Classroom/Classroom.schema";

export namespace ClassroomRepository {
  export async function create(Classroom: CreateClassroomDto) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Classroom.teacher_id },
    });

    const department = await prisma.department.findUnique({
      where: { id: Classroom.department_id },
    });

    if (!teacher) {
      throw new Error(`Teacher with id ${Classroom.teacher_id} not found`);
    }

    const grade_level = await prisma.gradeLevel.findUnique({
      where: { id: Classroom.grade_level_id },
    });

    if (!grade_level) {
      throw new Error(
        `GradeLevel with id ${Classroom.grade_level_id} not found`
      );
    }

    return prisma.classroom.create({
      data: {
        ...Classroom,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
    department_id?: string;
  }) {
    const where: any = options.search
      ? {
          name: {
            contains: options.search,
            mode: "insensitive",
          },
        }
      : {};

    if (options.department_id) {
      where.department_id = options.department_id;
    }

    return prisma.classroom.findMany({
      where,
      include: {
        department: true,
        grade_level: true,
        teacher: true,
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
      include: {
        department: true,
        grade_level: true,
        teacher: true,
        orders: {
          include: {
            order_items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  export async function update(
    ClassroomId: string,
    Classroom: UpdateClassroomDto
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

  export async function countAll(search?: string, department_id?: string) {
    const where: any = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    if (department_id) {
      where.department_id = department_id;
    }
    return await prisma.classroom.count({ where });
  }
}
