import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL tanımlı değil (.env.local dosyasını kontrol edin).');
}

// Disable prefetch as it is not supported for "Transaction" pooler mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };

