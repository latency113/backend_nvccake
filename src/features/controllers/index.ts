import { Elysia } from "elysia";

import { UserController } from "./User/User.controller";
import { DepartmentController } from "./Department/Department.controller";
import { TeacherController } from "./Teacher/Teacher.controller";
import { GradeLevelController } from "./GradeLevel/GradeLevel.controller";
import { ClassroomController } from "./Classroom/Classroom.controller";
import { TeamController } from "./Team/Team.controller";
import { ProductController } from "./Product/Product.controller";
import { OrderController } from "./Order/Order.controller";
import { OrderItemController } from "./OrderItem/OrderItem.controller";
import { AuthController } from "./auth/auth.controllers";
import { TokenController } from "./Token/Token.controller";

export const app = new Elysia().group("/api/v1", (app) => {
  app.use(AuthController.authController)
  app.use(TokenController.tokenController);
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
