import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { corsMiddleware } from "./shared/middleware/cors";

const app = new Elysia()
.use(swagger({ path: "/docs" }))
.use(corsMiddleware)
.listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/docs`
);
