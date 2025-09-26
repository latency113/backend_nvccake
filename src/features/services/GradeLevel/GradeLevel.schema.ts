import { t } from "elysia"

export const GradeLevelSchema = t.Object({
    id: t.String(),
    level: t.UnionEnum(["VOCATIONAL","HIGHER"]),
    year: t.Number()
})

export type GradeLevel = typeof GradeLevelSchema.static

export const GradeLevelWithRelationsSchema = t.Composite([
  GradeLevelSchema,
  t.Object({
    classroom: t.Array(t.Object({
      id: t.String(),
      name: t.String(),
      teacher_id: t.String(),
      department_id: t.String(),
      grade_level_id: t.String(),
    }))
  })
]);