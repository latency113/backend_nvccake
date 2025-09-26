import { t } from "elysia";

export const TeamSchema = t.Object({
  id: t.String(),
  name: t.String(),
  classroom_id: t.String(),
});

export type Team = typeof TeamSchema.static;
