import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutPreference } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { title, amount, quantity, externalReference } = await req.json();
    const preference = await createCheckoutPreference({ title, amount, quantity, externalReference });
    return NextResponse.json(preference);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro' }, { status: 500 });
  }
}
