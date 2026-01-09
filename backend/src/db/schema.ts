import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase'; // 2026 Supabase Helpers

// 1. ADVOCATE PROFILES
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id), // Links to Supabase Auth
    fullName: text('full_name').notNull(),
    barId: text('bar_id').unique(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    pgPolicy('advocate_own_profile', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = id`,
    }),
  ],
);

// 2. CLIENTS
export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    advocateId: uuid('advocate_id')
      .notNull()
      .references(() => profiles.id),
    name: text('name').notNull(),
    contact: text('contact'),
  },
  (t) => [
    pgPolicy('advocate_own_clients', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = advocate_id`,
    }),
  ],
);

// 3. THE CASE VAULT (With AI Context)
export const cases = pgTable(
  'cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    advocateId: uuid('advocate_id')
      .notNull()
      .references(() => profiles.id),
    clientId: uuid('client_id').references(() => clients.id),
    cnrNumber: text('cnr_number').unique(),
    title: text('title').notNull(),
    status: text('status').default('Pending'),
    nextHearing: date('next_hearing'),

    // THE "LEGAL BRAIN" COLUMN:
    // Stores arguments, law points, and AI-generated insights for winning.
    caseContext: jsonb('case_context').default({
      winning_points: [],
      research_citations: [],
      previous_arguments: [],
    }),

    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    pgPolicy('advocate_own_cases', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = advocate_id`,
    }),
  ],
);

// 4. HEARING DATES
export const hearingDates = pgTable(
  'hearing_dates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    hearingDate: date('hearing_date').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    pgPolicy('advocate_own_hearing_dates', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = (select advocate_id from cases where id = case_id)`,
    }),
  ],
);

// 5. LEGAL POINTS (For AI Context)
export const legalPoints = pgTable(
  'legal_points',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    pointType: text('point_type').notNull(), // e.g., 'law_point', 'argument', 'citation'
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    pgPolicy('advocate_own_legal_points', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = (select advocate_id from cases where id = case_id)`,
    }),
  ],
);

// 6. DRAFTS
export const drafts = pgTable(
  'drafts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    advocateId: uuid('advocate_id')
      .notNull()
      .references(() => profiles.id),
    templateType: text('template_type'),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    pgPolicy('advocate_own_drafts', {
      for: 'all',
      to: authenticatedRole,
      using: sql`auth.uid() = advocate_id`,
    }),
  ],
);

// Supabase Auth Internal Link (Mock for Drizzle)
export const authUsers = pgTable(
  'users',
  { id: uuid('id').primaryKey() },
  (t) => [],
);
