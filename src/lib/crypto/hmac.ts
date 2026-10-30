import { createHmac } from 'crypto';

/**
 * Generate a SHA-256 HMAC signature for a ticket payload.
 * Used for QR code tokens: HEADER.PAYLOAD.SIGNATURE
 */
export function signTicketPayload(payload: object, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'TICKET' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

/**
 * Verify a ticket QR token against the secret.
 * Returns decoded payload or null if invalid.
 */
export function verifyTicketToken(token: string, secret: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, body, sig] = parts;
    const data = `${parts[0]}.${body}`;
    const expectedSig = createHmac('sha256', secret).update(data).digest('base64url');
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Generate a Crockford Base32 ticket code: GR-XXXXX-XXXXX
 * Alphabet excludes confusing chars: I, L, O, U
 */
const CRB = '0123456789ABCDEFGHJKMNPQRTSTVWXYZ';

function randSeg(len: number): string {
  let r = '';
  for (let i = 0; i < len; i++) r += CRB[Math.floor(Math.random() * CRB.length)];
  return r;
}

export function generateTicketCode(prefix = 'GR'): string {
  return `${prefix}-${randSeg(5)}-${randSeg(5)}`;
}

export function isValidTicketCode(code: string): boolean {
  return /^GR-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/.test(code.toUpperCase());
}