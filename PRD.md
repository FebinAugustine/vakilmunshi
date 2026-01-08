# PRD (Product Requirements Document)

### 1.1 Project Vision

A "Virtual Junior Advocate" for Indian lawyers. It combines practice management (Diary, Clients, Billing) with an AI engine that drafts petitions and builds legal arguments based on stored case contexts and the Bhartiya Nyaya Sanhita (2026).

### 1.2 Key Features

- Identity & Security: Multi-tenant isolation (RLS), JWT rotation, and CSRF protection.

- Case Vault: Store CNR, party details, and legal points.

- AI Drafting Assistant: Context-aware drafting (Bail, Notices, Petitions) via OpenRouter.

- The "Legal Brain": Vectorized storage of past cases to generate winning arguments.

- Performance: Redis-backed rate limiting and caching for e-Courts data.

### 1.3 Tech Stack Specification

- Backend: NestJS (TypeScript), Passport.js, Redis (ioredis), OpenAI SDK (via OpenRouter).

- Database: Supabase (PostgreSQL), Drizzle ORM (Schema-first).

- Frontend: React (Vite), Tailwind CSS, Zustand (Store), TanStack Query (Server-state).

- Infrastructure: Supabase Auth, Supabase Storage (Buckets).
