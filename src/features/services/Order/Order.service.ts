import { OrderRepository } from "@/features/repository/Order/Order.repository"
import { CreateOrderDto, OrderSchema, UpdateOrderDto } from "./Order.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { OrderItemRepository } from "@/features/repository/OrderItem/OrderItem.repository";
import { TeamRepository } from "@/features/repository/Team/Team.repository";
import { TeamService } from "@/features/services/Team/Team.service";

export namespace OrderService {
  export async function create(
    order: CreateOrderDto
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

      if (newOrder.team_id) {
        console.log("OrderService.create: Recalculating team sales for team_id:", newOrder.team_id);
        await TeamService.recalculateTeamSales(newOrder.team_id);
      }

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
    data: UpdateOrderDto
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
      const existingOrder = await OrderRepository.findById(orderId);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      const updatedOrder = await OrderRepository.update(orderId, data);

      const oldTeamId = existingOrder.team_id;
      const newTeamId = updatedOrder.team_id;

      if (oldTeamId) {
        console.log("OrderService.update: Recalculating team sales for oldTeamId:", oldTeamId);
        await TeamService.recalculateTeamSales(oldTeamId);
      }

      if (newTeamId && newTeamId !== oldTeamId) {
        console.log("OrderService.update: Recalculating team sales for newTeamId:", newTeamId);
        await TeamService.recalculateTeamSales(newTeamId);
      }

      return updatedOrder;
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
      const orderToDelete = await OrderRepository.findById(orderId);
      if (!orderToDelete) {
        throw new Error("Order not found");
      }

      // Delete all associated order items first
      await OrderItemRepository.removeByOrderId(orderId);

      // Then delete the order
      await OrderRepository.remove(orderId);

      // Recalculate team sales if the order was associated with a team
      if (orderToDelete.team_id) {
        await TeamService.recalculateTeamSales(orderToDelete.team_id);
      }

      return { message: "Order and its items deleted successfully" };
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
