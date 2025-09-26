import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { corsMiddleware } from "./shared/middleware/cors";
import jwt from "@elysiajs/jwt";
import { app as mainApp } from "./features/controllers";

const app = new Elysia()
  .use(mainApp)
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
