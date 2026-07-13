import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: ".env.local" });
config();

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
