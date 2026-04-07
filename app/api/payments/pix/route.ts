import { NextRequest, NextResponse } from 'next/server';
import { createPixPayment } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { amount, email, externalReference, description } = await req.json();
    const payment = await createPixPayment({ amount, email, externalReference, description });
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro' }, { status: 500 });
  }
}
