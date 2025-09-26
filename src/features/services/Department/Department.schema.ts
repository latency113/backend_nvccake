import { t } from "elysia"
import { ClassroomSchema } from "../Classroom/Classroom.schema";
import { GradeLevelSchema } from "../GradeLevel/GradeLevel.schema";
import { CakeRequestSchema } from "../CakeRequest/CakeRequest.schema";

export const DepartmentSchema = t.Object({
    id: t.String(),
    name: t.String(),
})
export type Department = typeof DepartmentSchema.static

export const ClassroomWithGradeLevelSchema = t.Composite([
  ClassroomSchema,
  t.Object({
    grade_level: GradeLevelSchema,
  }),
]);

export const DepartmentWithRelationsSchema = t.Composite([
  DepartmentSchema,
  t.Object({
    classroom: t.Array(ClassroomWithGradeLevelSchema),
    cakeRequest: t.Array(CakeRequestSchema),
  }),
]);