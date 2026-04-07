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

    const provider = await prisma.providerConfig.upsert({
      where: { id: 1 },
      update: {
        externalApiUrl: body.externalApiUrl || null,
        externalApiKey: body.externalApiKey || null,
        mercadopagoAccessToken: body.mercadopagoAccessToken || null,
        mercadopagoPublicKey: body.mercadopagoPublicKey || null,
      },
      create: {
        id: 1,
        externalApiUrl: body.externalApiUrl || null,
        externalApiKey: body.externalApiKey || null,
        mercadopagoAccessToken: body.mercadopagoAccessToken || null,
        mercadopagoPublicKey: body.mercadopagoPublicKey || null,
      },
    });

    return NextResponse.json({ ok: true, provider });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar APIs.' },
      { status: 500 }
    );
  }
}