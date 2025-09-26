import { Elysia } from "elysia";

import { UserController } from "./User/User.controller";
import { DepartmentController } from "./Department/Department.controller";
import { TeacherController } from "./Teacher/Teacher.controller";
import { GradeLevelController } from "./GradeLevel/GradeLevel.controller";
import { ClassroomController } from "./Classroom/Classroom.controller";

export const app = new Elysia().group("/api/v1", (app) => {
  app.use(UserController.userController);
  app.use(DepartmentController.departmentController);
  app.use(TeacherController.teacherController);
  app.use(GradeLevelController.gradeLevelController);
  app.use(ClassroomController.classroomController);
  return app;
});
