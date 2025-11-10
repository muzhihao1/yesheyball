CREATE TABLE "goal_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text DEFAULT 'EASY' NOT NULL,
	"reward_xp" integer DEFAULT 10 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_dependencies" (
	"source_skill_id" integer NOT NULL,
	"target_skill_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_unlock_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"condition_type" varchar(50) NOT NULL,
	"condition_value" text NOT NULL,
	"required_count" integer DEFAULT 1 NOT NULL,
	"condition_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"position" jsonb DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialized_training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" uuid NOT NULL,
	"plan_order" integer NOT NULL,
	"exercise_name" varchar(200) NOT NULL,
	"exercise_description" text,
	"demo_video_url" varchar(500),
	"target_metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialized_trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_category" varchar(50) NOT NULL,
	"training_name" varchar(100) NOT NULL,
	"description" text,
	"difficulty_level" integer DEFAULT 1,
	"thumbnail_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"sub_skill_name" varchar(100) NOT NULL,
	"sub_skill_order" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_number" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"prerequisite_level_id" uuid,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_levels_level_number_unique" UNIQUE("level_number")
);
--> statement-breakpoint
CREATE TABLE "training_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"skill_order" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_skill_id" uuid NOT NULL,
	"unit_type" varchar(20) NOT NULL,
	"unit_order" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" jsonb NOT NULL,
	"xp_reward" integer DEFAULT 10,
	"estimated_minutes" integer DEFAULT 5,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_daily_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"goal_template_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skill_progress" (
	"user_id" varchar NOT NULL,
	"skill_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"unlock_context" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_training_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"level_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"progress_data" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "supabase_user_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "migrated_to_supabase" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_day" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "skill_dependencies" ADD CONSTRAINT "skill_dependencies_source_skill_id_skills_id_fk" FOREIGN KEY ("source_skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_dependencies" ADD CONSTRAINT "skill_dependencies_target_skill_id_skills_id_fk" FOREIGN KEY ("target_skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_unlock_conditions" ADD CONSTRAINT "skill_unlock_conditions_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialized_training_plans" ADD CONSTRAINT "specialized_training_plans_training_id_specialized_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."specialized_trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_skills" ADD CONSTRAINT "sub_skills_skill_id_training_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."training_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_levels" ADD CONSTRAINT "training_levels_prerequisite_level_id_training_levels_id_fk" FOREIGN KEY ("prerequisite_level_id") REFERENCES "public"."training_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_skills" ADD CONSTRAINT "training_skills_level_id_training_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."training_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_units" ADD CONSTRAINT "training_units_sub_skill_id_sub_skills_id_fk" FOREIGN KEY ("sub_skill_id") REFERENCES "public"."sub_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_goals" ADD CONSTRAINT "user_daily_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_goals" ADD CONSTRAINT "user_daily_goals_goal_template_id_goal_templates_id_fk" FOREIGN KEY ("goal_template_id") REFERENCES "public"."goal_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skill_progress" ADD CONSTRAINT "user_skill_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skill_progress" ADD CONSTRAINT "user_skill_progress_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_level_id_training_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."training_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_unit_id_training_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."training_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_training_progress_user_unit_unique" ON "user_training_progress" USING btree ("user_id","unit_id");