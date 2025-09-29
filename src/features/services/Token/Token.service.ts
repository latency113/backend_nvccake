import { TokenRepository } from "../../repository/Token/token.repository";
import { createTokenSchema, verifyTokenSchema, userIdSchema } from "./Token.schema";

export namespace TokenService {
  export async function generateToken(userId: string, expiresIn: number = 30) {
    try {
      const token = Bun.randomUUIDv7();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
      const tokenData = {
        token,
        user_id: userId,
        expires_at: expiresAt
      };

      const parsed = createTokenSchema.safeParse(tokenData);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return await TokenRepository.create(parsed.data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to generate token");
    }
  }

  export async function verifyToken(token: string) {
    try {
      const parsed = verifyTokenSchema.safeParse({ token });
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      const tokenRecord = await TokenRepository.findByToken(parsed.data.token);
      
      if (!tokenRecord) {
        return null;
      }

      if (tokenRecord.expires_at < new Date()) {
        await TokenRepository.removeToken(parsed.data.token);
        return null;
      }

      return tokenRecord;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to verify token");
    }
  }

  export async function getUserTokens(userId: string) {
    try {
      const parsed = userIdSchema.safeParse({ user_id: userId });
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return await TokenRepository.findByUserId(parsed.data.user_id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to get user tokens");
    }
  }

  export async function revokeToken(token: string) {
    try {
      const parsed = verifyTokenSchema.safeParse({ token });
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return await TokenRepository.removeToken(parsed.data.token);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to revoke token");
    }
  }

  export async function revokeAllUserTokens(userId: string) {
    try {
      const parsed = userIdSchema.safeParse({ user_id: userId });
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return await TokenRepository.deleteAllUserTokens(parsed.data.user_id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to revoke user tokens");
    }
  }

  export async function cleanupExpiredTokens() {
    try {
      return await TokenRepository.deleteExpired();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to cleanup expired tokens");
    }
  }
}