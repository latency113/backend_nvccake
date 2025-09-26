import { OrderRepository } from "@/features/repository/Order/Order.repository"
import { OrderSchema } from "./Order.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export namespace OrderService {
  export async function create(
    order: Omit<typeof OrderSchema, "id" | "createdAt" | "updatedAt">
  ) {
    if (!order.customerName || order.customerName.trim() === '') {
      throw new Error('Customer name is required and cannot be empty.');
    }
    if (order.totalPrice < 0) {
      throw new Error('Total price cannot be negative.');
    }
    if (order.deposit < 0) {
      throw new Error('Deposit cannot be negative.');
    }
    if (order.deposit > order.totalPrice) {
      throw new Error('Deposit cannot be greater than total price.');
    }

    // Check for duplicate book number and number combination
    const existingOrder = await OrderRepository.findByBookNumberAndNumber(
      order.book_number,
      order.number
    );
    if (existingOrder) {
      throw new Error('Book number and number combination already exists.');
    }

    try {
      const newOrder = await OrderRepository.create(order);
      return newOrder;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Book number and number combination already exists");
        }
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const orders = await OrderRepository.findAll({
      skip,
      take,
      search,
    });
    const total = await OrderRepository.countAll(search);

    const totalPages = Math.ceil(total / itemsPerPage);
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: orders,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  export async function findById(orderId: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  export async function update(
    orderId: string,
    data: Partial<Omit<typeof OrderSchema, "id" | "createdAt" | "updatedAt">>
  ) {
    if (data.totalPrice !== undefined && data.totalPrice < 0) {
      throw new Error('Total price cannot be negative.');
    }
    if (data.deposit !== undefined && data.deposit < 0) {
      throw new Error('Deposit cannot be negative.');
    }

    const existingOrder = await OrderRepository.findById(orderId);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (data.deposit !== undefined && data.totalPrice === undefined && data.deposit > existingOrder.totalPrice) {
      throw new Error('Deposit cannot be greater than total price.');
    }
    if (data.totalPrice !== undefined && data.deposit === undefined && existingOrder.deposit > data.totalPrice) {
      throw new Error('Total price cannot be less than deposit.');
    }
    if (data.totalPrice !== undefined && data.deposit !== undefined && data.deposit > data.totalPrice) {
      throw new Error('Deposit cannot be greater than total price.');
    }

    try {
      return await OrderRepository.update(orderId, data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Order not found");
        }
        if (error.code === "P2002") {
          throw new Error("Book number and number combination already exists");
        }
      }
      throw error;
    }
  }

  export async function remove(orderId: string) {
    try {
      return await OrderRepository.remove(orderId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Order not found");
      }
      throw error;
    }
  }
}
