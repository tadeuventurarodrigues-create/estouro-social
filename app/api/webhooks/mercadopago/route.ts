import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExternalOrder } from '@/lib/external-api';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const resource = payload?.data?.id || payload?.id;
    const topic = payload?.type || payload?.topic;

    if (!resource || !(topic === 'payment' || topic === 'merchant_order')) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: String(resource) },
      include: { order: { include: { service: true } } },
    });

    if (!payment) {
      return NextResponse.json({ received: true, missing: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'approved' },
    });

    if (payment.order.status === 'paid' || payment.order.status === 'sent_to_provider') {
      return NextResponse.json({ ok: true, duplicated: true });
    }

    await prisma.order.update({
      where: { id: payment.order.id },
      data: { status: 'paid' },
    });

    try {
      const externalResponse = await createExternalOrder({
        service: payment.order.service.externalServiceId || payment.order.service.id,
        username: payment.order.username || undefined,
        link: payment.order.link || undefined,
        quantity: payment.order.quantity || undefined,
      });

      await prisma.order.update({
        where: { id: payment.order.id },
        data: {
          status: 'sent_to_provider',
          externalOrderId: externalResponse?.order ? String(externalResponse.order) : null,
          providerResponse: JSON.stringify(externalResponse),
        },
      });
    } catch (externalError) {
      await prisma.order.update({
        where: { id: payment.order.id },
        data: {
          status: 'provider_error',
          providerResponse: JSON.stringify({
            message: externalError instanceof Error ? externalError.message : 'Erro desconhecido',
          }),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro no webhook' }, { status: 500 });
  }
}
