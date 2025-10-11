import prisma from "@/providers/database/database.provider";
import { CreateTeamDto, UpdateTeamDto } from "@/features/services/Team/Team.schema";

export namespace TeamRepository {
  export async function create(
    team: CreateTeamDto
  ) {
    return prisma.team.create({
      data: {
        name: team.name,
        classroom_ids: team.classroom_ids,
        team_type: team.team_type,
      },
    });
  }

  export async function findAll(options: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where = {
      ...(options.search && {
        name: {
          contains: options.search,
        },
      }),
      team_type: {
        in: ["team", "person"], // Ensure team_type is a valid enum value
      },
    };

    const teams = await prisma.team.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true
          }
        }
      },
      take: options.take,
      skip: options.skip,
    });

    // Manually fetch related data
    const teamsWithRelations = await Promise.all(
      teams.map(async (team) => {
        const classrooms = await prisma.classroom.findMany({
          where: { id: { in: team.classroom_ids } },
          include: {
            department: true,
            grade_level: true,
          }
        });

        // Extract unique departments and grade levels from classrooms
        const departmentMap = new Map();
        const gradeLevelMap = new Map();
        
        classrooms.forEach(classroom => {
          if (classroom.department) {
            departmentMap.set(classroom.department.id, classroom.department);
          }
          if (classroom.grade_level) {
            gradeLevelMap.set(classroom.grade_level.id, classroom.grade_level);
          }
        });

        return {
          ...team,
          classrooms,
          departments: Array.from(departmentMap.values()),
          gradeLevels: Array.from(gradeLevelMap.values()),
        };
      })
    );

    return teamsWithRelations;
  }

  export async function findById(teamId: string) {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        orders: true
      },
    });

    if (!team) {
      return null;
    }

    // Manually fetch related data
    const classrooms = await prisma.classroom.findMany({
      where: { id: { in: team.classroom_ids } },
      include: {
        department: true,
        grade_level: true,
      }
    });

    // Extract unique departments and grade levels from classrooms
    const departmentMap = new Map();
    const gradeLevelMap = new Map();
    
    classrooms.forEach(classroom => {
      if (classroom.department) {
        departmentMap.set(classroom.department.id, classroom.department);
      }
      if (classroom.grade_level) {
        gradeLevelMap.set(classroom.grade_level.id, classroom.grade_level);
      }
    });

    return {
      ...team,
      classrooms,
      departments: Array.from(departmentMap.values()),
      gradeLevels: Array.from(gradeLevelMap.values()),
    };
  }

  export async function update(
    teamId: string,
    team: UpdateTeamDto
  ) {
    return await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        ...(team.name !== undefined && { name: team.name }),
        ...(team.classroom_ids !== undefined && { classroom_ids: team.classroom_ids }),
        ...(team.team_type !== undefined && { team_type: team.team_type }),
      },
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