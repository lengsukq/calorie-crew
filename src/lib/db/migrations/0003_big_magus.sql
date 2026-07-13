CREATE TABLE "body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"chest_cm" numeric(6, 2),
	"waist_cm" numeric(6, 2),
	"hip_cm" numeric(6, 2),
	"arm_cm" numeric(6, 2),
	"leg_cm" numeric(6, 2),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "body_measurements_user_date_unique" UNIQUE("user_id","log_date")
);
--> statement-breakpoint
CREATE TABLE "sleep_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"sleep_minutes" integer NOT NULL,
	"quality" integer DEFAULT 3 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sleep_logs_user_date_unique" UNIQUE("user_id","log_date")
);
--> statement-breakpoint
CREATE TABLE "water_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"amount_ml" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "water_logs_user_date_id_unique" UNIQUE("user_id","log_date","id")
);
--> statement-breakpoint
ALTER TABLE "ai_advices" ADD COLUMN "feedback" text;--> statement-breakpoint
ALTER TABLE "ai_advices" ADD COLUMN "feedback_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_advices" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_advices" ADD COLUMN "dismissed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_advices" ADD COLUMN "dismissed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "food_logs" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "food_logs" ADD COLUMN "tags" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;