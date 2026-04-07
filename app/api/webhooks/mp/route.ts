import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExternalOrder } from '@/lib/external-api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('WEBHOOK MP RECEBIDO:', JSON.stringify(body, null, 2));

    const paymentId = body?.data?.id || body?.resource?.id || body?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true, message: 'Sem paymentId' });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      cache: 'no-store',
    });

    const payment = await mpRes.json();

    console.log('WEBHOOK MP PAGAMENTO:', JSON.stringify(payment, null, 2));

    if (!mpRes.ok) {
      return NextResponse.json(
        { error: 'Falha ao consultar pagamento no Mercado Pago.', payment },
        { status: 400 }
      );
    }

    const externalReference = payment?.external_reference;

    if (!externalReference) {
      return NextResponse.json({ ok: true, message: 'Sem external_reference' });
    }

    const orderId = Number(externalReference);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json({ ok: true, message: 'external_reference inválido' });
    }

    const localOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!localOrder) {
      return NextResponse.json({ ok: true, message: 'Pedido local não encontrado' });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId: String(payment.id) },
          { orderId: localOrder.id },
        ],
      },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: payment.status || 'pending',
          providerPaymentId: String(payment.id),
          rawResponse: JSON.stringify(payment),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: localOrder.id,
          provider: 'mercadopago',
          providerPaymentId: String(payment.id),
          status: payment.status || 'pending',
          amount: Number(payment.transaction_amount || localOrder.totalAmount || 0),
          rawResponse: JSON.stringify(payment),
        },
      });
    }

    if (payment.status !== 'approved') {
      await prisma.order.update({
        where: { id: localOrder.id },
        data: {
          status: 'pending_payment',
        },
      });

      return NextResponse.json({
        ok: true,
        message: `Pagamento ainda não aprovado: ${payment.status}`,
      });
    }

    if (localOrder.status !== 'paid' && localOrder.status !== 'sent') {
      await prisma.order.update({
        where: { id: localOrder.id },
        data: {
          status: 'paid',
        },
      });
    }

    if (!localOrder.service.externalServiceId) {
      return NextResponse.json({
        ok: true,
        message: 'Pagamento aprovado, mas serviço sem externalServiceId.',
      });
    }

    if (localOrder.status === 'sent') {
      return NextResponse.json({
        ok: true,
        message: 'Pedido já enviado ao provedor.',
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

    return NextResponse.json({
      ok: true,
      message: 'Pagamento aprovado e pedido enviado.',
    });
  } catch (error) {
    console.error('ERRO WEBHOOK MP:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro interno no webhook.',
      },
      { status: 500 }
    );
  }
}