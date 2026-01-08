import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env.validation'; // Using your Zod-validated env

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
