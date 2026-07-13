ALTER TABLE "users" ADD COLUMN "weight_target_kg" numeric(6, 2);--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "total_exercise_kcal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "net_kcal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "daily_summaries"
SET
  "total_exercise_kcal" = 0,
  "net_kcal" = "total_kcal",
  "remaining_kcal" = "target_kcal" - "total_kcal";--> statement-breakpoint
CREATE TABLE "weight_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "log_date" date NOT NULL,
  "weight_kg" numeric(6, 2) NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "weight_logs_user_date_unique" UNIQUE("user_id", "log_date")
);--> statement-breakpoint
CREATE TABLE "exercise_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "log_date" date NOT NULL,
  "exercise_type" text NOT NULL,
  "duration_minutes" integer NOT NULL,
  "calories_burned" integer NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "exercise_logs_user_date_id_unique" UNIQUE("user_id", "log_date", "id")
);--> statement-breakpoint
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "weight_logs_user_date_idx" ON "weight_logs" USING btree ("user_id", "log_date");--> statement-breakpoint
CREATE INDEX "exercise_logs_user_date_idx" ON "exercise_logs" USING btree ("user_id", "log_date");
