import { z } from "zod";

const baseCredentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const loginSchema = baseCredentialsSchema;

export const registerSchema = baseCredentialsSchema.extend({
  inviteCode: z.string().trim().min(8).max(128),
});
