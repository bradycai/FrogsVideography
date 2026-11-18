#!/usr/bin/env node
/* Creates (or updates) the inquiries table: `npm run db:setup`.
 * Reads DATABASE_URL (or NETLIFY_DATABASE_URL) from the environment or .env. */
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

try {
  process.loadEnvFile(); // Node 20.12+; loads ./.env if present
} catch {
  // No .env file — rely on variables already set in the environment.
}

const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env or export it, then re-run.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.file(fileURLToPath(new URL('../db/schema.sql', import.meta.url)));
  console.log('✓ inquiries table is ready');
} catch (err) {
  console.error('✗ Could not set up the database:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
