# The Master TODO List (Step-by-Step)

## Phase 1: Environment & Core Infrastructure

[x] 1.1 Initialize Workspace: - Create a monorepo or split folders: /apps/server and /apps/client.

[x] 1.2 Supabase Setup: - Create a new project. Enable Auth (Email/OTP). Create a documents bucket.

[x] 1.3 Drizzle Schema Design: - Define profiles, clients, cases, hearing_dates, and legal_points (for AI context).

Implement RLS Policies in the schema file using auth.uid().

[x] 1.4 NestJS Boilerplate: - Install dependencies: @nestjs/jwt, passport-jwt, drizzle-orm, ioredis, csurf.

Setup ConfigModule for .env management.

## Phase 2: Security & Authentication (The "Production-Ready" Layer)

[x] 2.1 JWT Strategy: - Implement AccessToken (short-lived) and RefreshToken (stored in Redis).

Create a Guard for Token Rotation (invalidate old refresh tokens upon use).

[x] 2.2 Security Middleware: - Configure ThrottlerModule with ThrottlerStorageRedisService.

Setup csurf for CSRF protection on POST/PUT requests.

Implement helmet and cors with strict whitelisting.

## Phase 3: The "Legal Brain" (Database & Logic)

[x] 3.1 Case Management Service: - CRUD for cases and clients.

Implement a CaseContextService that aggregates all stored "Law Points" and "Previous Arguments" for a specific case.

[x] 3.2 Drizzle Transactions: - Ensure that when a case is deleted, all AI-generated drafts and legal points are also cleaned up (Cascade).

## Phase 4: AI Integration (OpenRouter)

[x] 4.1 OpenRouter Service: - Create a wrapper for OpenRouter.

Set up model-switching logic (e.g., use Gemini-Flash for summaries, DeepSeek-R1 for logic).

[x] 4.2 Context-Aware Drafting: - Create a prompt builder that pulls data from the cases table.

Logic: Draft(caseId, templateType) -> Fetch Context -> Prompt AI -> Save Result to DB.

## Phase 5: Frontend (React & UX)

[x] 5.1 State Management: - Setup Zustand stores for useAuth and useCaseStore.

[x] 5.2 TanStack Query Integration: - Build hooks for useCases(), useDrafts(), and useProfile().

[x] 5.3 Tailwind Dashboard: - Build a "Daily Case List" view and an "AI Drafting Sidebar.". UI/UX Design must be industry level, modern and production ready.
