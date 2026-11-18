/* ============================================================================
 *  Contact-form inquiries: validation, storage and retrieval (server-only).
 *  Table definition: db/schema.sql. Encryption: src/lib/crypto.ts.
 * ========================================================================== */
import { SERVICES } from '../config/site';
import { db } from './db';
import { decryptField, encryptField, lookupHash } from './crypto';

export interface InquiryInput {
  name: string;
  email: string;
  organization: string;
  projectType: string;
  message: string;
}

export interface Inquiry extends InquiryInput {
  id: string;
  createdAt: Date;
  /** How many inquiries (including this one) came from the same email address. */
  senderTotal: number;
}

/** Generous caps — far above anything a real visitor types, small enough to stop abuse. */
const MAX_LENGTH: Record<keyof InquiryInput, number> = {
  name: 500,
  email: 320,
  organization: 500,
  projectType: 200,
  message: 20000,
};

// Same options the <select> in src/components/Contact.astro renders.
const PROJECT_TYPES = new Set<string>([
  '',
  ...SERVICES.items.map((s) => s.title),
  'Something else',
]);

// The HTML spec's definition of a valid email address — exactly what the
// browser's type="email" check accepts, so nothing the form allows is rejected here.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export type ParseResult = { ok: true; value: InquiryInput } | { ok: false; error: string };

/** Validates a submission using the same rules as the form (required fields + email format). */
export function parseInquiry(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null)
    return { ok: false, error: 'Expected a JSON object.' };
  const raw = body as Record<string, unknown>;

  const value = {} as InquiryInput;
  for (const field of Object.keys(MAX_LENGTH) as (keyof InquiryInput)[]) {
    const v = raw[field] ?? '';
    if (typeof v !== 'string') return { ok: false, error: `"${field}" must be a string.` };
    const trimmed = v.trim();
    if (trimmed.length > MAX_LENGTH[field]) return { ok: false, error: `"${field}" is too long.` };
    value[field] = trimmed;
  }

  if (!value.name) return { ok: false, error: 'Name is required.' };
  if (!value.message) return { ok: false, error: 'Message is required.' };
  if (!EMAIL_RE.test(value.email)) return { ok: false, error: 'A valid email is required.' };
  if (!PROJECT_TYPES.has(value.projectType)) return { ok: false, error: 'Unknown project type.' };

  return { ok: true, value };
}

/** Max submissions per IP address per hour. */
const RATE_LIMIT = { max: 5, windowMinutes: 60 };

export async function isRateLimited(ip: string): Promise<boolean> {
  const [{ count }] = await db()<{ count: number }[]>`
    select count(*)::int as count
    from inquiries
    where ip_hmac = ${lookupHash('ip', ip)}
      and created_at > now() - make_interval(mins => ${RATE_LIMIT.windowMinutes})
  `;
  return count >= RATE_LIMIT.max;
}

export async function saveInquiry(input: InquiryInput, ip: string): Promise<void> {
  await db()`
    insert into inquiries
      (project_type, name_enc, email_enc, email_hmac, org_enc, message_enc, ip_hmac)
    values (
      ${input.projectType},
      ${encryptField(input.name, 'name')},
      ${encryptField(input.email, 'email')},
      ${lookupHash('email', input.email)},
      ${input.organization ? encryptField(input.organization, 'organization') : null},
      ${encryptField(input.message, 'message')},
      ${lookupHash('ip', ip)}
    )
  `;
}

interface InquiryRow {
  id: string;
  created_at: Date;
  project_type: string;
  name_enc: Buffer;
  email_enc: Buffer;
  org_enc: Buffer | null;
  message_enc: Buffer;
  sender_total: number;
}

/** Newest first, decrypted. Only called from the password-protected admin page. */
export async function listInquiries(limit = 500): Promise<Inquiry[]> {
  const rows = await db()<InquiryRow[]>`
    select id, created_at, project_type, name_enc, email_enc, org_enc, message_enc,
           (count(*) over (partition by email_hmac))::int as sender_total
    from inquiries
    order by created_at desc
    limit ${limit}
  `;
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    projectType: row.project_type,
    name: decryptField(row.name_enc, 'name'),
    email: decryptField(row.email_enc, 'email'),
    organization: row.org_enc ? decryptField(row.org_enc, 'organization') : '',
    message: decryptField(row.message_enc, 'message'),
    senderTotal: row.sender_total,
  }));
}
