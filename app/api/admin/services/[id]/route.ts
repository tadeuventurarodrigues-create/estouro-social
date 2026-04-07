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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = ensureAdmin(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const service = await prisma.service.update({
      where: { id: Number(id) },
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
      { error: error instanceof Error ? error.message : 'Erro ao atualizar serviço.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = ensureAdmin(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const orderCount = await prisma.order.count({
      where: { serviceId: Number(id) },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Esse serviço já possui pedidos vinculados. Desative em vez de excluir.' },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao excluir serviço.' },
      { status: 500 }
    );
  }
}