import { t } from "elysia";

export const OrderStatus = t.UnionEnum(["pending", "complete", "cancelled"]);

export const OrderSchema = t.Object({
  id: t.String(),
  customerName: t.String(),
  classroom_id: t.Optional(t.String()),
  team_id: t.Optional(t.Nullable(t.String())),
  orderDate: t.Nullable(t.Date()),
  totalPrice: t.Number(),
  book_number: t.Number(),
  number: t.Number(),
  phone: t.String(),
  pickup_date: t.Nullable(t.Date()),
  depository: t.Optional(t.String()),
  deposit: t.Number(),
  advisor: t.String(),
  status: OrderStatus,
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Order = typeof OrderSchema.static;

// Reference schemas to avoid circular dependencies
const ClassroomReferenceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  teacher_id: t.String(),
  department_id: t.String(),
  grade_level_id: t.String(),
});

const TeamReferenceSchema = t.Object({
  id: t.Optional(t.String()),
  name: t.Optional(t.String()),
  classroom_id: t.Optional(t.String()),
});

const OrderItemReferenceSchema = t.Object({
  id: t.String(),
  order_id: t.String(),
  product_id: t.String(),
  pound: t.Number(),
  quantity: t.Number(),
  unitPrice: t.Number(),
  subtotal: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const OrderWithRelationsSchema = t.Composite([
  OrderSchema,
  t.Object({
    classroom: t.Optional(ClassroomReferenceSchema),
    team: t.Nullable(TeamReferenceSchema),
    order_items: t.Array(OrderItemReferenceSchema),
  }),
]);
