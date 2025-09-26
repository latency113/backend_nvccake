import { t } from "elysia";

export const OrderStatus = t.UnionEnum(["pending", "complete", "cancelled"]);

export const OrderSchema = t.Object({
  id: t.String(),
  customerName: t.String(),
  classroom_id: t.Optional(t.String()),
  team_id: t.Optional(t.String()),
  orderDate: t.Date(),
  totalPrice: t.Number(),
  book_number: t.Number(),
  number: t.Number(),
  phone: t.String(),
  pickup_date: t.Date(),
  depository: t.Optional(t.String()),
  deposit: t.Number(),
  advisor: t.String(),
  status: OrderStatus,
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Order = typeof OrderSchema.static;
