CREATE TABLE "hearing_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"hearing_date" date NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hearing_dates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "legal_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"point_type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "legal_points" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "hearing_dates" ADD CONSTRAINT "hearing_dates_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_points" ADD CONSTRAINT "legal_points_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "advocate_own_hearing_dates" ON "hearing_dates" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select advocate_id from cases where id = case_id));--> statement-breakpoint
CREATE POLICY "advocate_own_legal_points" ON "legal_points" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select advocate_id from cases where id = case_id));