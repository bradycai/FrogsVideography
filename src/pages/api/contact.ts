/* ============================================================================
 *  POST /api/contact — stores a contact-form inquiry (runs as a Netlify Function).
 *
 *  Called in the background by src/scripts/contact.js. The visitor-facing form
 *  behaves the same whether or not this succeeds; this endpoint only keeps a
 *  record of every inquiry so none are lost.
 *
 *  Responses: 201 saved · 400 invalid · 413 too large · 429 rate-limited · 500 error
 * ========================================================================== */
import type { APIRoute } from 'astro';
import { isRateLimited, parseInquiry, saveInquiry } from '../../lib/inquiries';

export const prerender = false;

const MAX_BODY_BYTES = 100_000;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, error: 'Send JSON.' });
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES)
    return json(413, { ok: false, error: 'Submission is too large.' });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON.' });
  }

  // Honeypot: the hidden "website" field is invisible to people but bots fill it in.
  // Pretend it worked so they don't learn to avoid it.
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === 'string' && trap.trim() !== '') return json(201, { ok: true });

  const parsed = parseInquiry(body);
  if (!parsed.ok) return json(400, { ok: false, error: parsed.error });

  let ip = '';
  try {
    ip = context.clientAddress;
  } catch {
    // Address unavailable — skip rate limiting rather than risk dropping real inquiries.
  }

  try {
    if (ip && (await isRateLimited(ip))) {
      return json(429, { ok: false, error: 'Too many messages — please try again later.' });
    }
    await saveInquiry(parsed.value, ip || 'unknown');
    return json(201, { ok: true });
  } catch (err) {
    console.error('[api/contact] could not save inquiry:', err);
    return json(500, { ok: false, error: 'Could not save your message.' });
  }
};
