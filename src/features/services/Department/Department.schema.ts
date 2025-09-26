import { t } from "elysia"
import { CakeRequestSchema } from "../CakeRequest/CakeRequest.schema";

export const DepartmentSchema = t.Object({
    id: t.String(),
    name: t.String(),
})
export type Department = typeof DepartmentSchema.static

export const DepartmentWithRelationsSchema = t.Composite([
  DepartmentSchema,
  t.Object({
    classroom: t.Array(t.Object({
      id: t.String(),
      name: t.String(),
      teacher_id: t.String(),
      department_id: t.String(),
      grade_level_id: t.String(),
      grade_level: t.Object({
        id: t.String(),
        level: t.UnionEnum(["VOCATIONAL","HIGHER"]),
        year: t.Number()
      })
    })),
    cakeRequest: t.Array(CakeRequestSchema),
  }),
]);