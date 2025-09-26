import { UserRepository } from "@/features/repository/User/user.repository";
import { userSchema } from "./User.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace UserService {
  export async function create(
    user: Omit<typeof userSchema, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const hashPassword = await Bun.password.hash(user.password);
      return await UserRepository.create({
        ...user,
        password: hashPassword,
      });
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Username already exists");
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
    const users = await UserRepository.findAll({ skip, take, search });
    const total = await UserRepository.countAll(search);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: users,
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

  export async function findById(userId: string) {
    return UserRepository.findById(userId);
  }

  export async function update(
    userId: string,
    user: Partial<
      Pick<
        typeof userSchema,
        "firstname" | "lastname" | "username" | "email" | "password" | "role"
      >
    >
  ) {
    try {
      const data = { ...user };

      if (user.password) {
        data.password = await Bun.password.hash(user.password);
      }
      return await UserRepository.update(userId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Username already exists");
      }
      throw error;
    }
  }

  export async function deleteById(userId: string) {
    return UserRepository.deleteById(userId);
  }
}
