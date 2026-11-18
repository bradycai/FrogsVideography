#!/usr/bin/env node
/* ============================================================================
 *  Generates the backend's secrets. Paste the printed lines into Netlify →
 *  Site configuration → Environment variables (and into .env for local dev).
 *
 *    npm run secrets:key       → DATA_ENCRYPTION_KEY (do this ONCE)
 *    npm run secrets:password  → ADMIN_PASSWORD_HASH (any time you change the password)
 *
 *  The hash format must match verifyAdminPassword() in src/lib/crypto.ts:
 *  scrypt:<N>:<r>:<p>:<salt base64url>:<hash base64url>
 * ========================================================================== */
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline';

const SCRYPT = { N: 2 ** 17, r: 8, p: 1, keylen: 64, maxmem: 256 * 1024 * 1024 }; // OWASP-recommended cost
const MIN_PASSWORD_LENGTH = 12;

function printKey() {
  console.log(`DATA_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`);
  console.error(
    '\n⚠️  Set this once and keep a copy somewhere safe (e.g. a password manager).\n' +
      '   If it is lost or replaced, inquiries already stored can never be decrypted.',
  );
}

/**
 * Reads a line without echoing it when run in a terminal. Prompts go to stderr
 * so stdout carries only the env line (e.g. `npm run -s secrets:password >> .env`).
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
      terminal: process.stdin.isTTY,
    });
    let muted = false;
    const write = rl._writeToOutput?.bind(rl);
    if (write) rl._writeToOutput = (s) => (muted ? undefined : write(s));
    rl.question(question, (answer) => {
      rl.close();
      process.stderr.write('\n');
      resolve(answer);
    });
    muted = true;
  });
}

async function printPasswordHash() {
  const password = await ask('New admin password: ');
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }
  if (process.stdin.isTTY && (await ask('Type it again: ')) !== password) {
    console.error('Passwords did not match.');
    process.exit(1);
  }
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  const { N, r, p } = SCRYPT;
  console.log(
    `ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString('base64url')}:${hash.toString('base64url')}`,
  );
}

const command = process.argv[2];
if (command === 'key') printKey();
else if (command === 'password') await printPasswordHash();
else {
  console.error('Usage: node scripts/secrets.mjs <key|password>');
  process.exit(1);
}
