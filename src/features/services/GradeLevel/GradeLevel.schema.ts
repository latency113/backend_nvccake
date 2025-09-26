import { t } from "elysia"
import { ClassroomWithAllRelationsSchema } from "../Classroom/Classroom.schema";

export const GradeLevelSchema = t.Object({
    id: t.String(),
    level: t.UnionEnum(["VOCATIONAL","HIGHER"]),
    year: t.Number()
    
})
export type GradeLevel = typeof GradeLevelSchema.static

export const GradeLevelWithRelationsSchema = t.Composite([
  GradeLevelSchema,
  t.Object({
    classroom: t.Array(ClassroomWithAllRelationsSchema),
  }),
]);