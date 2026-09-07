/**
 * Guestbook storage — the D1 half of the Worker.
 *
 * Entries live in a real database, not in the visitor's browser, so what one
 * person writes everyone else sees. D1 rather than KV on purpose: two people
 * signing at the same moment would silently overwrite each other in a
 * read-modify-write store, and a guestbook is exactly where that happens.
 *
 * A public form is a spam magnet, so:
 *   · one entry per IP per minute, and 5 per IP per day
 *   · hard caps on name and message length
 *   · a honeypot field no human ever fills in
 *   · addresses are stored only as a salted hash, never in the clear
 *   · you can delete anything with your admin token
 *
 * Schema: see worker/schema.sql
 */

const NAME_MAX = 40;
const MESSAGE_MAX = 500;
const PAGE_SIZE = 50;

/* Rate limits, per address. */
const PER_MINUTE = 1;
const PER_DAY = 5;

/** Addresses are never stored raw — only a hash, and only to count posts. */
async function hashAddress(ip, salt) {
  const data = new TextEncoder().encode(String(ip) + '|' + String(salt || ''));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, '')   // control characters
    .trim()
    .slice(0, max);
}

export async function listEntries(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, message, created FROM entries ORDER BY id DESC LIMIT ?1'
  ).bind(PAGE_SIZE).all();

  return results || [];
}

export async function addEntry(env, request, body) {
  // The honeypot: a field hidden from people, irresistible to bots. Anything
  // in it means the submission is thrown away — and told it succeeded, so the
  // bot has no signal to adapt to.
  if (clean(body.website, 200)) { return { ok: true, skipped: true }; }

  const name = clean(body.name, NAME_MAX);
  const message = clean(body.message, MESSAGE_MAX);

  if (!name || !message) {
    return { ok: false, status: 400, error: 'name_and_message_required' };
  }

  const ipHash = await hashAddress(
    request.headers.get('CF-Connecting-IP') || 'unknown',
    env.IP_SALT
  );

  const recent = await env.DB.prepare(
    "SELECT" +
    "  (SELECT COUNT(*) FROM entries WHERE ip_hash = ?1 AND created > datetime('now', '-60 seconds')) AS last_minute," +
    "  (SELECT COUNT(*) FROM entries WHERE ip_hash = ?1 AND created > datetime('now', '-1 day')) AS last_day"
  ).bind(ipHash).first();

  if (recent && recent.last_minute >= PER_MINUTE) {
    return { ok: false, status: 429, error: 'too_fast' };
  }
  if (recent && recent.last_day >= PER_DAY) {
    return { ok: false, status: 429, error: 'daily_limit' };
  }

  const row = await env.DB.prepare(
    "INSERT INTO entries (name, message, created, ip_hash) VALUES (?1, ?2, datetime('now'), ?3) RETURNING id, name, message, created"
  ).bind(name, message, ipHash).first();

  return { ok: true, entry: row };
}

export async function deleteEntry(env, request, id) {
  const token = request.headers.get('X-Admin-Token') || '';

  // No token configured means deletion is switched off entirely, rather than
  // open to everybody.
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  await env.DB.prepare('DELETE FROM entries WHERE id = ?1').bind(Number(id)).run();
  return { ok: true, deleted: Number(id) };
}
