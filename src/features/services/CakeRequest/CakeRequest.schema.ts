import { t } from "elysia";

export const CakeRequestSchema = t.Object({
  id: t.String(),
  requestDate: t.Date(),
  status: t.UnionEnum(["pending", "approved", "rejected"]),
  note: t.Optional(t.String()),
  user_id: t.String(),
  department_id: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type CakeRequest = typeof CakeRequestSchema.static;
