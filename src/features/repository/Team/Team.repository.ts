import prisma from "@/providers/database/database.provider";
import { TeamSchema } from "@/features/services/Team/Team.schema";

export namespace TeamRepository {
  export async function create(
    team: Pick<typeof TeamSchema, "name" | "classroom_id">
  ) {
    return prisma.team.create({
      data: {
        ...team,
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

    return prisma.team.findMany({
      where,
      include: {
        classroom: true,
        orders: {
          select: {
            id: true
          }
        }
      },
      take: options.take,
      skip: options.skip,
    });
  }

  export async function findById(teamId: string) {
    return await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        classroom: true,
        orders: true
      },
    });
  }

  export async function update(
    teamId: string,
    team: Partial<Pick<typeof TeamSchema, "name" | "classroom_id">>
  ) {
    return await prisma.team.update({
      where: {
        id: teamId,
      },
      data: team,
    });
  }

  export async function remove(teamId: string) {
    return await prisma.team.delete({
      where: {
        id: teamId,
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

    return prisma.team.count({
      where,
    });
  }
}