import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { createPixPayment, createCheckoutPreference } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();

    const serviceId = Number(body.serviceId);
    const customerName = String(body.customerName || '').trim();
    const customerEmail = String(body.customerEmail || '').trim();
    const username = String(body.username || '').trim();
    const link = String(body.link || '').trim();
    const paymentMethod = body.paymentMethod === 'checkout' ? 'checkout' : 'pix';

    if (!serviceId) {
      return NextResponse.json({ error: 'Serviço inválido.' }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório.' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.enabled) {
      return NextResponse.json(
        { error: 'Serviço não encontrado ou desativado.' },
        { status: 404 }
      );
    }

    const amount = Number(service.rate);

    const numericUserId =
      session?.userId && !Number.isNaN(Number(session.userId))
        ? Number(session.userId)
        : null;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        username: username || null,
        link: link || null,
        quantity: 1,
        totalAmount: amount,
        paymentMethod,
        status: 'pending_payment',
        serviceId: service.id,
        userId: numericUserId,
      },
    });

    if (paymentMethod === 'pix') {
      const pix = await createPixPayment({
        amount,
        email: customerEmail,
        externalReference: String(order.id),
        description: service.name,
      });

      const transactionData = pix.point_of_interaction?.transaction_data;

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'mercadopago',
          providerPaymentId: pix.id ? String(pix.id) : null,
          status: pix.status || 'pending',
          amount,
          qrCode: transactionData?.qr_code || null,
          qrCodeBase64: transactionData?.qr_code_base64 || null,
          rawResponse: JSON.stringify(pix),
        },
      });

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        paymentMethod: 'pix',
        pixQrCode: transactionData?.qr_code || null,
        pixQrCodeBase64: transactionData?.qr_code_base64 || null,
      });
    }

    const preference = await createCheckoutPreference({
      title: service.name,
      amount,
      quantity: 1,
      externalReference: String(order.id),
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'mercadopago',
        providerPaymentId: preference.id ? String(preference.id) : null,
        status: 'pending',
        amount,
        checkoutUrl: preference.init_point || null,
        rawResponse: JSON.stringify(preference),
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      paymentMethod: 'checkout',
      checkoutUrl: preference.init_point || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao criar pedido.',
      },
      { status: 500 }
    );
  }
}