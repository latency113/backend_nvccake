import { z } from 'zod';

export const createTokenSchema = z.object({
  token: z.string(),
  user_id: z.string(),
  expires_at: z.date()
});

export const verifyTokenSchema = z.object({
  token: z.string()
});

export const userIdSchema = z.object({
  user_id: z.string()
});

export type CreateToken = z.infer<typeof createTokenSchema>;
export type VerifyToken = z.infer<typeof verifyTokenSchema>;
export type userId = z.infer<typeof userIdSchema>;