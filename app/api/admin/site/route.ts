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

    const site = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {
        brandName: body.brandName,
        siteTitle: body.siteTitle,
        siteDescription: body.siteDescription,
        heroBadge: body.heroBadge,
        heroTitle: body.heroTitle,
        heroDescription: body.heroDescription,
        logoUrl: body.logoUrl || null,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        backgroundColor: body.backgroundColor,
        cardColor: body.cardColor,
        textColor: body.textColor,
      },
      create: {
        id: 1,
        brandName: body.brandName,
        siteTitle: body.siteTitle,
        siteDescription: body.siteDescription,
        heroBadge: body.heroBadge,
        heroTitle: body.heroTitle,
        heroDescription: body.heroDescription,
        logoUrl: body.logoUrl || null,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        backgroundColor: body.backgroundColor,
        cardColor: body.cardColor,
        textColor: body.textColor,
      },
    });

    return NextResponse.json({ ok: true, site });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar site.' },
      { status: 500 }
    );
  }
}