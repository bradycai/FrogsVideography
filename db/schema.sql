-- Contact-form inquiries. Safe to run repeatedly: `npm run db:setup`.
--
-- Personal fields are encrypted by the app (AES-256-GCM, src/lib/crypto.ts)
-- before they reach the database, so `*_enc` columns hold ciphertext only.
-- `*_hmac` columns are keyed hashes: they let the app match repeat senders and
-- rate-limit by IP without storing either value in readable form.

create table if not exists inquiries (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  project_type  text        not null default '',  -- one of the form's fixed options
  name_enc      bytea       not null,
  email_enc     bytea       not null,
  email_hmac    bytea       not null,
  org_enc       bytea,                             -- null when left blank
  message_enc   bytea       not null,
  ip_hmac       bytea       not null
);

create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
create index if not exists inquiries_ip_recent_idx  on inquiries (ip_hmac, created_at);
create index if not exists inquiries_email_hmac_idx on inquiries (email_hmac);
