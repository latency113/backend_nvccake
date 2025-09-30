import { t } from "elysia";

export const CakeRequestItemSchema = t.Object({
  id: t.String(),
  request_id: t.String(),
  order_item_id: t.String(),
});

export type CakeRequestItem = typeof CakeRequestItemSchema.static;
