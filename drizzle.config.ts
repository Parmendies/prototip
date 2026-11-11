import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Kimlik bilgileri yalnızca .env.local içinde tutulur
    url: (process.env.DIRECT_URL || process.env.DATABASE_URL)!,
  },
});

