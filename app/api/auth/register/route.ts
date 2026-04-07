import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/session';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Preencha nome, e-mail e senha.' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Esse e-mail já está cadastrado.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: 'CUSTOMER',
      },
    });

    const token = createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: 'CUSTOMER',
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro no cadastro.' }, { status: 500 });
  }
}
