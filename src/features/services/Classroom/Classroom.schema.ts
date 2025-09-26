import { t } from "elysia";
import { DepartmentSchema } from "../Department/Department.schema";
import { GradeLevelSchema } from "../GradeLevel/GradeLevel.schema";
import { TeamSchema } from "../Team/Team.schema";
import { OrderSchema } from "../Order/Order.schema";
import { TeacherSchema, TeacherWithRelationsSchema } from "../Teacher/Teacher.schema";

export const ClassroomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
});

export type Classroom = typeof ClassroomSchema.static;

export const ClassroomWithAllRelationsSchema = t.Composite([
  ClassroomSchema,
  t.Object({
    teacher: t.Recursive(() => TeacherWithRelationsSchema),
    department: DepartmentSchema,
    grade_level: GradeLevelSchema,
    teams: t.Array(TeamSchema),
    orders: t.Array(OrderSchema),
  }),
]);
