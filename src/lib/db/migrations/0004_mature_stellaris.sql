ALTER TABLE "body_measurements" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "total_water_ml" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "sleep_minutes" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "body_measurements_user_date_idx" ON "body_measurements" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "food_logs_user_date_idx" ON "food_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "invite_codes_created_by_idx" ON "invite_codes" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "invite_usages_code_idx" ON "invite_usages" USING btree ("invite_code_id");--> statement-breakpoint
CREATE INDEX "invite_usages_invited_idx" ON "invite_usages" USING btree ("invited_user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sleep_logs_user_date_idx" ON "sleep_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "water_logs_user_date_idx" ON "water_logs" USING btree ("user_id","log_date");