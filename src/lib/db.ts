/* Postgres connection (server-only). One small pool per function instance. */
import postgres from 'postgres';
import { DATABASE_URL, NETLIFY_DATABASE_URL } from 'astro:env/server';

let client: postgres.Sql | undefined;

export function db(): postgres.Sql {
  const url = DATABASE_URL || NETLIFY_DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  client ??= postgres(url, {
    max: 1, // serverless: each function instance handles one request at a time
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // required by pooled connection strings (e.g. Neon's "-pooler" host)
  });
  return client;
}
