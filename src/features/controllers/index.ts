import { Elysia } from "elysia";

import { UserController } from "@/features/controllers/User/User.controller";
import { DepartmentController } from "@/features/controllers/Department/Department.controller";
import { TeacherController } from "@/features/controllers/Teacher/Teacher.controller";
import { GradeLevelController } from "@/features/controllers/GradeLevel/GradeLevel.controller";
import { ClassroomController } from "@/features/controllers/Classroom/Classroom.controller";
import { TeamController } from "@/features/controllers/Team/Team.controller";
import { ProductController } from "@/features/controllers/Product/Product.controller";
import { OrderController } from "@/features/controllers/Order/Order.controller";
import { OrderItemController } from "@/features/controllers/OrderItem/OrderItem.controller";
import { AuthController } from "@/features/controllers/auth/auth.controllers";

export const app = new Elysia().group("/api/v1", (app) => {
  app.use(AuthController.authController)
  app.use(UserController.userController);
  app.use(DepartmentController.departmentController);
  app.use(TeacherController.teacherController);
  app.use(GradeLevelController.gradeLevelController);
  app.use(ClassroomController.classroomController);
  app.use(TeamController.teamController);
  app.use(ProductController.productController);
  app.use(OrderController.orderController);
  app.use(OrderItemController.orderItemController);
  return app;
});
