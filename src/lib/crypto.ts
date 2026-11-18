/* ============================================================================
 *  Encryption + auth helpers for the contact-form backend (server-only).
 *
 *  • Personal fields (name, email, organization, message) are encrypted with
 *    AES-256-GCM *before* they reach Postgres, so a leaked database or backup
 *    contains only ciphertext. They are decrypted only on the admin page.
 *  • Keyed hashes (HMAC-SHA256) let the app spot repeat senders and rate-limit
 *    by IP without storing those values in readable form.
 *  • The admin password is never stored — only a scrypt hash of it.
 *
 *  All keys come from one secret, DATA_ENCRYPTION_KEY (32 random bytes,
 *  base64). Separate sub-keys are derived from it with HKDF so no key is used
 *  for two jobs. ⚠️ If DATA_ENCRYPTION_KEY is lost or changed, stored
 *  inquiries can no longer be decrypted.
 * ========================================================================== */
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';
import { ADMIN_PASSWORD_HASH, DATA_ENCRYPTION_KEY } from 'astro:env/server';

/** Bumped if the ciphertext layout or algorithm ever changes. */
const FORMAT_VERSION = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;

type Purpose = 'encrypt' | 'lookup' | 'session';
const subkeys = new Map<Purpose, Buffer>();

function masterKey(): Buffer {
  if (!DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY is not set (run `npm run secrets:key`).');
  }
  const key = Buffer.from(DATA_ENCRYPTION_KEY, 'base64');
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes, base64-encoded.');
  }
  return key;
}

function subkey(purpose: Purpose): Buffer {
  let key = subkeys.get(purpose);
  if (!key) {
    key = Buffer.from(
      hkdfSync('sha256', masterKey(), Buffer.alloc(0), `frogs-inquiries/${purpose}`, 32),
    );
    subkeys.set(purpose, key);
  }
  return key;
}

/**
 * Encrypts one field. Layout: version (1 byte) | IV (12) | auth tag (16) | ciphertext.
 * The column name is bound in as associated data, so a value copied into a
 * different column fails to decrypt instead of being silently misread.
 */
export function encryptField(plaintext: string, column: string): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', subkey('encrypt'), iv);
  cipher.setAAD(Buffer.from(column));
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from([FORMAT_VERSION]), iv, cipher.getAuthTag(), body]);
}

export function decryptField(blob: Buffer, column: string): string {
  if (blob.length < 1 + IV_BYTES + TAG_BYTES || blob[0] !== FORMAT_VERSION) {
    throw new Error(`Unrecognized ciphertext in column "${column}".`);
  }
  const iv = blob.subarray(1, 1 + IV_BYTES);
  const tag = blob.subarray(1 + IV_BYTES, 1 + IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv('aes-256-gcm', subkey('encrypt'), iv);
  decipher.setAAD(Buffer.from(column));
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(blob.subarray(1 + IV_BYTES + TAG_BYTES)),
    decipher.final(),
  ]).toString('utf8');
}

/** Deterministic keyed hash, for matching values without storing them readably. */
export function lookupHash(kind: 'email' | 'ip', value: string): Buffer {
  return createHmac('sha256', subkey('lookup'))
    .update(`${kind}:${value.trim().toLowerCase()}`)
    .digest();
}

/* --------------------------------- Admin auth -------------------------------- */

export function adminConfigured(): boolean {
  return Boolean(ADMIN_PASSWORD_HASH && DATA_ENCRYPTION_KEY);
}

/**
 * Checks a password against ADMIN_PASSWORD_HASH, which has the form
 * `scrypt:<N>:<r>:<p>:<salt>:<hash>` (salt + hash base64url) — produced by
 * `npm run secrets:password` (scripts/secrets.mjs).
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const parts = (ADMIN_PASSWORD_HASH ?? '').split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');
  // A malformed or truncated hash must never compare equal (two empty buffers would).
  if (salt.length < 16 || expected.length < 32) return false;
  try {
    const actual = await new Promise<Buffer>((resolve, reject) =>
      scrypt(password, salt, expected.length, { N, r, p, maxmem: 256 * 1024 * 1024 }, (err, key) =>
        err ? reject(err) : resolve(key),
      ),
    );
    return timingSafeEqual(actual, expected);
  } catch {
    return false; // invalid scrypt parameters in the env var
  }
}

/** Session lifetime for the admin page. */
export const SESSION_SECONDS = 8 * 60 * 60;

function sessionSignature(expires: string): Buffer {
  // Mixing in the password hash means changing the password signs everyone out.
  return createHmac('sha256', subkey('session'))
    .update(`${expires}.${ADMIN_PASSWORD_HASH ?? ''}`)
    .digest();
}

export function createSessionToken(): string {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${sessionSignature(expires).toString('base64url')}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now() / 1000) return false;
  const given = Buffer.from(signature, 'base64url');
  const expected = sessionSignature(expires);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
