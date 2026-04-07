import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

function ensureAdmin(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function POST(req: NextRequest) {
  const session = ensureAdmin(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const service = await prisma.service.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        imageUrl: body.imageUrl || null,
        externalServiceId: body.externalServiceId ? Number(body.externalServiceId) : null,
        rate: Number(body.rate),
        min: Number(body.min),
        max: Number(body.max),
        enabled: Boolean(body.enabled),
        fieldsJson: body.fieldsJson || '[]',
      },
    });

    return NextResponse.json({ ok: true, service });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar serviço.' },
      { status: 500 }
    );
  }
}