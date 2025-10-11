import Elysia, { t } from "elysia";
import { TokenService } from "../../services/Token/Token.service";
import { CreateTokenDto, VerifyTokenDto } from "@/features/services/Token/Token.schema";

export namespace TokenController {
  export const tokenController = new Elysia({ prefix: "/tokens" })
    .post(
      "/generate",
      async ({ body, set }) => {
        try {
          const token = await TokenService.generateToken(body);
          set.status = 201;
          return token;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        body: CreateTokenDto,
        tags: ["Token"],
      }
    )
    .get(
      "/verify/:token",
      async ({ params, set }) => {
        try {
          const tokenRecord = await TokenService.verifyToken(params);
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
        params: VerifyTokenDto,
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
      async ({ params, set }) => {
        try {
          await TokenService.revokeToken(params);
          set.status = 204;
          return null;
        } catch (error: any) {
          set.status = "Bad Request";
          return { error: error.message };
        }
      },
      {
        params: VerifyTokenDto,
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
