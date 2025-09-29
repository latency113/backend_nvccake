import { Elysia, t } from "elysia";
import { UserService } from "../../services/User/User.service";
import { TokenService } from "../../services/Token/Token.service";
import { jwt } from "@elysiajs/jwt";

export namespace AuthController {
  const jwtPlugin = {
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'supersecret'
  };

  export const authController = new Elysia({ prefix: "/auth" })
    .use(jwt(jwtPlugin))
    .post(
      "/login",
      async ({ body, set, jwt: jwtHandler }) => {
        try {
          const { username, password } = body;
          const result = await UserService.login(username, password, jwtHandler);
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
            access_token: t.String(),
            refresh_token: t.String(),
            user: t.Object({
              id: t.String(),
              username: t.String(),
              role: t.String(),
              firstname: t.String(),
              lastname: t.String(),
              email: t.Optional(t.String())
            })
          }),
          500: t.String(),
        },
        tags: ["Authentication"],
      }
    )
    .get(
      "/me",
      async ({ jwt: jwtHandler, set, headers }) => {
        try {
          const authHeader = headers["authorization"];
          const refreshToken = headers["x-refresh-token"];

          if (!authHeader) {
            set.status = 401;
            return { message: "Authorization header missing" };
          }

          const token = authHeader.split(" ")[1];
          const payload = await jwtHandler.verify(token);
          
          if (!payload || typeof payload !== 'object') {
            // Access token ไม่ถูกต้อง ลองตรวจสอบ refresh token
            if (refreshToken) {
              const tokenRecord = await TokenService.verifyToken(refreshToken);
              if (tokenRecord) {
                // สร้าง access token ใหม่
                const newPayload = {
                  role: tokenRecord.user.role,
                  username: tokenRecord.user.username,
                  sub: tokenRecord.user_id
                };
                const newToken = await jwtHandler.sign(newPayload);
                set.status = 200;
                set.headers["x-user-role"] = tokenRecord.user.role;
                set.headers["x-username"] = tokenRecord.user.username;
                return {
                  ...tokenRecord.user,
                  access_token: newToken
                };
              }
            }
            set.status = 401;
            return { message: "Invalid token" };
          }

          const user = await UserService.findById(payload.sub as string);
          if (!user) {
            set.status = 401;
            return { message: "User not found" };
          }

          set.status = 200;
          set.headers["x-user-role"] = user.role;
          set.headers["x-username"] = user.username;
          return {
            id: user.id,
            username: user.username,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
          };
        } catch (error) {
          console.error(error);
          set.status = "Internal Server Error";
          return "Failed";
        }
      },
      {
        response: {
          200: t.Object({
            id: t.String(),
            username: t.String(),
            role: t.String(),
            firstname: t.String(),
            lastname: t.String(),
            email: t.Optional(t.String())
          }),
          401: t.Object({
            message: t.String()
          }),
          500: t.String()
        },
        tags: ["Authentication"],
        detail: {
          security: [{ bearerAuth: [] }],
        },
      }
    )
    .post(
      "/logout",
      async ({ headers, set }) => {
        try {
          const refreshToken = headers["x-refresh-token"];
          if (!refreshToken) {
            set.status = 400;
            return { message: "Refresh token missing" };
          }

          await TokenService.revokeToken(refreshToken);
          set.status = 200;
          return { message: "Logged out successfully" };
        } catch (error) {
          console.error(error);
          set.status = "Internal Server Error";
          return { message: "Failed to logout" };
        }
      },
      {
        response: {
          200: t.Object({
            message: t.String()
          }),
          400: t.Object({
            message: t.String()
          }),
          500: t.Object({
            message: t.String()
          })
        },
        tags: ["Authentication"]
      }
    );
}
