CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"advocate_id" uuid NOT NULL,
	"template_type" text,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "drafts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_advocate_id_profiles_id_fk" FOREIGN KEY ("advocate_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "advocate_own_drafts" ON "drafts" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = advocate_id);