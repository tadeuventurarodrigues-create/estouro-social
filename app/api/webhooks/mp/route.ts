import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExternalOrder } from '@/lib/external-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('WEBHOOK MP RECEBIDO:', body);

    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      cache: 'no-store',
    });

    const payment = await res.json();

    console.log('WEBHOOK MP DETALHE:', payment);

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao consultar pagamento no Mercado Pago.' }, { status: 400 });
    }

    const externalReference = payment?.external_reference;

    if (!externalReference) {
      return NextResponse.json({ ok: true });
    }

    const orderId = Number(externalReference);

    const localOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!localOrder) {
      return NextResponse.json({ ok: true });
    }

    await prisma.payment.updateMany({
      where: {
        orderId: localOrder.id,
        providerPaymentId: String(payment.id),
      },
      data: {
        status: payment.status || 'pending',
        rawResponse: JSON.stringify(payment),
      },
    });

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true });
    }

    if (localOrder.status === 'paid' || localOrder.status === 'sent') {
      return NextResponse.json({ ok: true, message: 'Pedido já processado.' });
    }

    await prisma.order.update({
      where: { id: localOrder.id },
      data: {
        status: 'paid',
      },
    });

    if (!localOrder.service.externalServiceId) {
      return NextResponse.json({
        ok: true,
        message: 'Pagamento aprovado, mas serviço sem externalServiceId.',
      });
    }

    const providerResponse = await createExternalOrder({
      service: localOrder.service.externalServiceId,
      link: localOrder.link || undefined,
      username: localOrder.username || undefined,
      quantity: 1,
    });

    const externalOrderId =
      providerResponse?.order?.toString?.() ||
      providerResponse?.id?.toString?.() ||
      null;

    await prisma.order.update({
      where: { id: localOrder.id },
      data: {
        status: 'sent',
        externalOrderId,
        providerResponse: JSON.stringify(providerResponse),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('ERRO WEBHOOK MP:', error);
    return NextResponse.json({ error: 'Erro interno no webhook.' }, { status: 500 });
  }
}