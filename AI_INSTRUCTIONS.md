# Instructions for your AI Assistant (KiloCode/Gemini)

## Prompt 1: Database Setup

"Act as a Senior Backend Engineer. Using Drizzle ORM and Supabase Postgres, generate a schema for a legal app. Include tables for 'profiles', 'clients', and 'cases'. The 'cases' table must have a JSONB column for 'case_context' to store law points and AI arguments. Ensure Row Level Security (RLS) is applied so that advocate_id must match auth.uid(). Provide the Drizzle schema and the migration command."

## Prompt 2: Authentication Layer

"In NestJS, implement a JWT Authentication system with Refresh Token rotation. Use Redis (ioredis) to store the refresh tokens. Include an 'AuthGuard' that checks for both Access and Refresh tokens. Also, add Rate Limiting using the NestJS Throttler with Redis storage."

## Prompt 3: OpenRouter AI Service

"Create a NestJS service called 'AiDraftingService'. It should use the OpenAI SDK to connect to OpenRouter.ai. Create a function generateWinningArgument(caseId: string) that fetches case facts from the database, builds a prompt using Indian Law context, and returns a structured response from the 'deepseek/deepseek-r1' model."

## Prompt 4: React Frontend (Zustand + Query)

"Act as a Senior Frontend Engineer. Build a React dashboard component using Tailwind CSS. Use TanStack Query to fetch the 'Daily Cause List' from the NestJS backend. Integrate a Zustand store to manage the current advocate's session and handle JWT refresh logic in an Axios interceptor."

# AI Development & Drafting Standards: VakilMunshi

## 1. Legal Compliance & Jurisdiction

- **Primary Jurisdiction:** India.
- **2026 Standards:** Default to **Bhartiya Nyaya Sanhita (BNS)**, **BNSS**, and **BSA** for all new matters.
- **Legacy Support:** Only use IPC/CrPC/IEA sections if the case `created_at` or `incident_date` is prior to July 1, 2024.
- **Citation Style:** Use standard Indian Bluebook or Supreme Court citation formats (e.g., _AIR 2024 SC 123_).

## 2. Drafting Tone & Persona

- **Role:** You are a "Senior Chamber Junior." Your drafts must be formal, persuasive, and precise.
- **Language:** Indian English (e.g., use 'Lakhs', 'Crores', 'Vakalatnama', 'Ld. Counsel').
- **Constraint:** Never "hallucinate" case laws. If you are unsure of a citation, use a placeholder like `[CITE RELEVANT PRECEDENT]` and flag it to the user.

## 3. Technical Constraints (Stack Specific)

- **Database:** Use Drizzle ORM syntax. Always respect RLS by including `auth.uid()` checks in queries.
- **Safety:** Never output raw SQL strings; always use Drizzle's `sql` template literal to prevent injection.
- **State Management:** Use Zustand for client-side state. Do not use Redux.
- **AI Context:** When drafting, always look for data in the `case_context` JSONB column before asking the user for facts.

## 4. BNS vs. IPC Mapping Logic

- When a user mentions a crime (e.g., "Theft"), provide the mapping:
  - _IPC Section 378_ -> **BNS Section 303**.
- Always include a disclaimer: "Drafted based on BNS 2023. Please verify with the latest Gazette notifications."
