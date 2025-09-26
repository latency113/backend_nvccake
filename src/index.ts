import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { corsMiddleware } from "./shared/middleware/cors";
import { UserController } from "./features/controllers/User/user.controller";
import jwt from "@elysiajs/jwt";

const app = new Elysia()
  .group("/api/v1", (app) => app.use(UserController.userController))
  .use(swagger({ path: "/docs" }))
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "supersecret",
    })
  )
  .use(corsMiddleware)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/docs`
);
