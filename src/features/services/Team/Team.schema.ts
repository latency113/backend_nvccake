import { t } from "elysia";

export const TeamSchema = t.Object({
  id: t.String(),
  name: t.String(),
  classroom_id: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Team = typeof TeamSchema.static;

// Define classroom reference schema to avoid circular dependencies
const ClassroomReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
});

export const TeamWithRelationsSchema = t.Composite([
  TeamSchema,
  t.Object({
    classroom: ClassroomReferenceSchema,
    orders: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
  }),
]);
