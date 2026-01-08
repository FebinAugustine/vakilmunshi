CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advocate_id" uuid NOT NULL,
	"client_id" uuid,
	"cnr_number" text,
	"title" text NOT NULL,
	"status" text DEFAULT 'Pending',
	"next_hearing" date,
	"case_context" jsonb DEFAULT '{"winning_points":[],"research_citations":[],"previous_arguments":[]}'::jsonb,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cases_cnr_number_unique" UNIQUE("cnr_number")
);
--> statement-breakpoint
ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advocate_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact" text
);
--> statement-breakpoint
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"bar_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_bar_id_unique" UNIQUE("bar_id")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_advocate_id_profiles_id_fk" FOREIGN KEY ("advocate_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_advocate_id_profiles_id_fk" FOREIGN KEY ("advocate_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "advocate_own_cases" ON "cases" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = advocate_id);--> statement-breakpoint
CREATE POLICY "advocate_own_clients" ON "clients" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = advocate_id);--> statement-breakpoint
CREATE POLICY "advocate_own_profile" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = id);