import Elysia, { t } from "elysia";
import { TokenService } from "../../services/Token/Token.service";

export namespace TokenController {
  export const tokenController = new Elysia({ prefix: "/tokens" })
    .post(
      "/generate",
      async ({ body, set }) => {
        try {
          const { userId, expiresIn } = body;
          const token = await TokenService.generateToken(userId, expiresIn);
          set.status = 201;
          return token;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        body: t.Object({
          userId: t.String(),
          expiresIn: t.Optional(t.Number()),
        }),
        tags: ["Token"],
      }
    )
    .get(
      "/verify/:token",
      async ({ params: { token }, set }) => {
        try {
          const tokenRecord = await TokenService.verifyToken(token);
          if (!tokenRecord) {
            set.status = "Not Found";
            return { error: "Token not found or expired" };
          }
          return tokenRecord;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        tags: ["Token"],
      }
    )
    .get(
      "/user/:userId",
      async ({ params: { userId }, set }) => {
        try {
          return await TokenService.getUserTokens(userId);
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        tags: ["Token"],
      }
    )
    .delete(
      "/:token",
      async ({ params: { token }, set }) => {
        try {
          await TokenService.revokeToken(token);
          set.status = 204;
          return null;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        tags: ["Token"],
      }
    )
    .delete(
      "/user/:userId",
      async ({ params: { userId }, set }) => {
        try {
          await TokenService.revokeAllUserTokens(userId);
          set.status = 204;
          return null;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        tags: ["Token"],
      }
    )
    .delete(
      "/cleanup/expired",
      async ({ set }) => {
        try {
          return await TokenService.cleanupExpiredTokens();
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        tags: ["Token"],
      }
    );
}
