CREATE TABLE "user_foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"serving_description" text DEFAULT '' NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
	"protein_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"carbs_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"fat_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_foods" ADD CONSTRAINT "user_foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_foods_user_id_idx" ON "user_foods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_foods_user_usage_idx" ON "user_foods" USING btree ("user_id","usage_count");