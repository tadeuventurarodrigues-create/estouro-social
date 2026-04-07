import { createHmac } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'ventura_session';

type SessionPayload = {
  userId: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || 'change-me-in-production';
}

function base64url(input: string) {
  return Buffer.from(input).toString('base64url');
}

function unbase64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>, days = 7) {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const encoded = base64url(JSON.stringify(fullPayload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (expected !== signature) return null;
  try {
    const payload = JSON.parse(unbase64url(encoded)) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
