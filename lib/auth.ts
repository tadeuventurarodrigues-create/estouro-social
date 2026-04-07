import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN';
};

const COOKIE_NAME = 'ventura_admin_session';

function getAuthSecret() {
  return process.env.AUTH_SECRET || 'troque-essa-chave-em-producao';
}

function sign(value: string) {
  return crypto
    .createHmac('sha256', getAuthSecret())
    .update(value)
    .digest('hex');
}

function encodeSession(payload: SessionPayload) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64url');
  const signature = sign(base64);
  return `${base64}.${signature}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [base64, signature] = token.split('.');
  if (!base64 || !signature) return null;

  const expected = sign(base64);
  if (signature !== expected) return null;

  try {
    const json = Buffer.from(base64, 'base64url').toString('utf8');
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export function buildAdminSession() {
  return {
    userId: 'env-admin',
    name: process.env.ADMIN_NAME || 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    role: 'ADMIN' as const,
  };
}

export function isValidAdminLogin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  return email === adminEmail && password === adminPassword;
}

export function createSessionToken() {
  return encodeSession(buildAdminSession());
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const session = decodeSession(token);
    if (!session) return null;

    return { user: session };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireAdminSession() {
  const session = await getCurrentUser();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Não autorizado');
  }

  return session;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;