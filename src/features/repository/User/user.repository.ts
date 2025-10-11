import prisma from "@/providers/database/database.provider";
import { CreateUserDto, UpdateUserDto } from "@/features/services/User/User.schema";

export namespace UserRepository {
  export async function create(
    user: CreateUserDto
  ) {
    return prisma.user.create({
      data: {
        ...user,
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
          username: {
            contains: options.search,
          },
        }
      : {};

    return prisma.user.findMany({
      where,
      take: options.take,
      skip: options.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  export async function findUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  export async function findById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  export async function update(
    userId: string,
    user: UpdateUserDto
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...user,
      },
    });
  }

  export async function deleteById(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  export async function countAll(search?: string) {
    const where = search
      ? {
          username: {
            contains: search,
          },
        }
      : {};
    return await prisma.user.count({ where });
  }
}
