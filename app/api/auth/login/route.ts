import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, createSessionToken, isValidAdminLogin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    if (!isValidAdminLogin(email, password)) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
    }

    const token = createSessionToken();

    const res = NextResponse.json({
      ok: true,
      redirectTo: '/admin',
    });

    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Erro ao fazer login.' }, { status: 500 });
  }
}