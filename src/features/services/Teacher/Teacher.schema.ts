import { t } from "elysia";
import { ClassroomWithAllRelationsSchema } from "../Classroom/Classroom.schema";

export const TeacherSchema = t.Object({
  id: t.String(),
  name: t.String().Min(1),
});
export type Teacher = typeof TeacherSchema.static;

export const TeacherWithRelationsSchema = t.Composite([
  TeacherSchema,
  t.Object({
    classroom: t.Array(t.Recursive(() => ClassroomWithAllRelationsSchema)),
  }),
]);
