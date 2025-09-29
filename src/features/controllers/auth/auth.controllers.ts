import Elysia, { t } from "elysia";
import { UserService } from "../../services/User/User.service";
import jwt from "@elysiajs/jwt";

export namespace AuthController {
  export const authController = new Elysia({ prefix: "/auth" })
    .post(
      "/login",
      async ({ body, set, jwt }) => {
        try {
          const { username, password } = body as {
            username: string;
            password: string;
          };
          const result = await UserService.login(username, password, jwt);
          set.status = "OK";
          return result;
        } catch (error) {
          console.error(error);
          set.status = "Internal Server Error";
          return "Login failed";
        }
      },
      {
        body: t.Object({
          username: t.String(),
          password: t.String(),
        }),
        response: {
          200: t.Object({
            token: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Authentication"],
      }
    )
    .get(
      "/me",
      async ({ jwt, set, headers }) => {
        try {
          const authHeader = headers["authorization"];
          if (!authHeader) {
            set.status = 401;
            return { message: "Authorization header missing" };
          }

          const token = authHeader.split(" ")[1];
          const payload: any = await jwt.verify(token);
          if (!payload) {
            set.status = 401;
            return { message: "Invalid token" };
          }
          set.status = 200;
          set.headers["x-user-role"] = payload.role;
          set.headers["x-username"] = payload.username;
          return payload;
        } catch (error) {
          console.error(error);
          set.status = "Internal Server Error";
          return "Failed";
        }
      },
      {
        tags: ["Authentication"],
        detail: {
          security: [{ bearerAuth: [] }],
        },
      }
    );
}
