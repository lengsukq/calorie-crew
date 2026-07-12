import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  SESSION_SECRET: z.string().min(32),
  INITIAL_INVITE_CODE: z.string().min(8),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().optional(),
  AI_API_KEY: z.string().optional(),
});

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? (isBuild ? "postgresql://build:build@localhost/build" : undefined),
  SESSION_SECRET: process.env.SESSION_SECRET ?? (isBuild ? "build-placeholder-secret-1234567890" : undefined),
  INITIAL_INVITE_CODE: process.env.INITIAL_INVITE_CODE ?? (isBuild ? "build-placeholder-invite" : undefined),
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
  AI_API_KEY: process.env.AI_API_KEY,
});
