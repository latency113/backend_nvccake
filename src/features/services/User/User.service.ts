import { UserRepository } from "@/features/repository/User/user.repository";
import { UserSchema } from "./User.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TokenService } from "../Token/Token.service";

type JWTInstance = {
  sign: (payload: Record<string, unknown>) => Promise<string>;
};

export namespace UserService {
  export async function create(
    user: Omit<typeof UserSchema, "id" | "createdAt" | "updatedAt">
  ) {
    if (!user.firstname || user.firstname.trim() === '') {
      throw new Error('User firstname is required and cannot be empty.');
    }
    if (!user.lastname || user.lastname.trim() === '') {
      throw new Error('User lastname is required and cannot be empty.');
    }
    if (!user.username || user.username.trim() === '') {
      throw new Error('User username is required and cannot be empty.');
    }
    if (!user.password || user.password.trim() === '') {
      throw new Error('User password is required and cannot be empty.');
    }
    try {
      const hashPassword = await Bun.password.hash(user.password);
      const newUser = await UserRepository.create({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: hashPassword,
      });
      return newUser;
    } catch (error) {
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
        typeof UserSchema,
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
    } catch (error) {
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

  export async function login(username: string, password: string, jwt: JWTInstance) {
    const user = await UserRepository.findUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await Bun.password.verify(password, user.password);
    } catch (_error) {
      throw new Error("Invalid password");
    }

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const payload = {
      role: user.role,
      username: user.username,
      sub: user.id // ใส่ user id เข้าไปใน token payload
    }

    // สร้าง JWT token
    const jwtToken = await jwt.sign(payload);

    // สร้าง token ในฐานข้อมูล
    const dbToken = await TokenService.generateToken(user.id);

    return {
      access_token: jwtToken,
      refresh_token: dbToken.token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    };
  }
}
