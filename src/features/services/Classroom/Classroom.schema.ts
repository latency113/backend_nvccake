import { t } from "elysia";

export const ClassroomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Classroom = typeof ClassroomSchema.static;

// Define the teacher schema with classroom array
const TeacherWithClassroomsSchema = t.Object({
  id: t.String(),
  name: t.String(),
  department_id: t.String(),
});

export const ClassroomWithAllRelationsSchema = t.Composite([
  ClassroomSchema,
  t.Object({
    teacher: TeacherWithClassroomsSchema,
    department: t.Object({
      id: t.String(),
      name: t.String(),
    }),
    grade_level: t.Object({
      id: t.String(),
      level: t.UnionEnum(["VOCATIONAL", "HIGHER"]),
      year: t.Number(),
    }),
    teams: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
    orders: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
  }),
]);
