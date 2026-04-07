import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  return { session, user };
}

export async function requireUserSession() {
  const data = await getCurrentUser();
  if (!data) redirect('/login');
  return data;
}

export async function requireAdminSession() {
  const data = await requireUserSession();
  if (data.user.role !== 'ADMIN') redirect('/dashboard');
  return data;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
}

export function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
