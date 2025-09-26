import { TeamRepository } from "@/features/repository/Team/Team.repository"
import { TeamSchema } from "./Team.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace TeamService {
  export async function create(
    team: Omit<typeof TeamSchema, "id">
  ) {
    if (!team.name || team.name.trim() === '') {
      throw new Error('Team name is required and cannot be empty.');
    }
    try {
      const newTeam = TeamRepository.create(team);
      return newTeam;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Team name already exists");
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
    const teams = await TeamRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await TeamRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: teams,
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

  export async function findById(teamId: string) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    return team;
  }

  export async function update(
    teamId: string,
    data: Partial<Omit<typeof TeamSchema, "id">>
  ) {
    try {
      return await TeamRepository.update(teamId, data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Team not found");
        }
        if (error.code === "P2002") {
          throw new Error("Team name already exists");
        }
      }
      throw error;
    }
  }

  export async function remove(teamId: string) {
    try {
      return await TeamRepository.remove(teamId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Team not found");
      }
      throw error;
    }
  }
}
