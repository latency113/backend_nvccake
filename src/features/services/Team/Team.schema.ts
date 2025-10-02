import { t } from "elysia";

export const TeamSchema = t.Object({
  id: t.String(),
  name: t.String(),
  classroom_ids: t.Array(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Team = typeof TeamSchema.static;

// Define reference schemas to avoid circular dependencies
const ClassroomReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
});

const DepartmentReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

const GradeLevelReferenceSchema = t.Object({
  id: t.String(),
  level: t.String(),
  year: t.Number(),
});

export const TeamWithRelationsSchema = t.Composite([
  TeamSchema,
  t.Object({
    classrooms: t.Optional(t.Array(ClassroomReferenceSchema)),
    departments: t.Optional(t.Array(DepartmentReferenceSchema)),
    gradeLevels: t.Optional(t.Array(GradeLevelReferenceSchema)),
    orders: t.Optional(t.Array(
      t.Object({
        id: t.String(),
      })
    )),
  }),
]);
