CREATE TABLE "ai_advices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"summary" text NOT NULL,
	"suggestions" json NOT NULL,
	"read_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_advices_user_type_expires_unique" UNIQUE("user_id","type","expires_at")
);
--> statement-breakpoint
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
	CONSTRAINT "exercise_logs_user_date_id_unique" UNIQUE("user_id","log_date","id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"birth_date" date,
	"gender" text DEFAULT 'male',
	"height_cm" integer,
	"activity_level" text DEFAULT 'sedentary',
	"health_goal" text DEFAULT 'general_health',
	"weight_target_kg" numeric(6, 2),
	"ai_advice_enabled" boolean DEFAULT true NOT NULL,
	"ai_advice_frequency" text DEFAULT 'daily',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"weight_kg" numeric(6, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weight_logs_user_date_unique" UNIQUE("user_id","log_date")
);
--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "total_exercise_kcal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD COLUMN "net_kcal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "weight_target_kg" numeric(6, 2);--> statement-breakpoint
ALTER TABLE "ai_advices" ADD CONSTRAINT "ai_advices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_advices_user_created_idx" ON "ai_advices" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "exercise_logs_user_date_idx" ON "exercise_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE INDEX "user_profiles_updated_at_idx" ON "user_profiles" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "weight_logs_user_date_idx" ON "weight_logs" USING btree ("user_id","log_date");