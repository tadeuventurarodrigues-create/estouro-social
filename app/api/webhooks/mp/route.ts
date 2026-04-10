import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MP_API_BASE = 'https://api.mercadopago.com/v1';

type MercadoPagoPayment = {
  id?: string | number;
  status?: string;
  status_detail?: string;
  external_reference?: string | number | null;
  transaction_amount?: number;
  payment_method_id?: string | null;
  date_approved?: string | null;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string | null;
      qr_code_base64?: string | null;
    };
  } | null;
};

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
  }

  return token;
}

function normalizeOrderStatus(paymentStatus?: string) {
  switch (paymentStatus) {
    case 'approved':
      return 'paid';
    case 'authorized':
    case 'in_process':
    case 'pending':
    case 'in_mediation':
      return 'pending_payment';
    case 'cancelled':
    case 'rejected':
    case 'refunded':
    case 'charged_back':
      return 'payment_failed';
    default:
      return 'pending_payment';
  }
}

async function fetchPayment(paymentId: string) {
  const token = getAccessToken();

  const response = await fetch(`${MP_API_BASE}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = (await response.json()) as MercadoPagoPayment & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || `Erro ao consultar pagamento ${paymentId} no Mercado Pago.`);
  }

  return data;
}

async function persistPayment(payment: MercadoPagoPayment) {
  const providerPaymentId = payment.id ? String(payment.id) : null;
  const externalReference = payment.external_reference ? String(payment.external_reference) : null;

  if (!providerPaymentId && !externalReference) {
    return;
  }

  const orderId = externalReference && /^\d+$/.test(externalReference) ? Number(externalReference) : null;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true },
      })
    : null;

  const amount = Number(payment.transaction_amount || order?.totalAmount || 0);
  const qrData = payment.point_of_interaction?.transaction_data;

  const existingPayment = providerPaymentId
    ? await prisma.payment.findFirst({
        where: {
          provider: 'mercadopago',
          providerPaymentId,
        },
      })
    : order?.payments?.[0] || null;

  const paymentData = {
    provider: 'mercadopago',
    providerPaymentId,
    status: payment.status || 'pending',
    amount,
    qrCode: qrData?.qr_code || existingPayment?.qrCode || null,
    qrCodeBase64: qrData?.qr_code_base64 || existingPayment?.qrCodeBase64 || null,
    rawResponse: JSON.stringify(payment),
  };

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: paymentData,
    });
  } else if (order) {
    await prisma.payment.create({
      data: {
        ...paymentData,
        orderId: order.id,
      },
    });
  }

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: normalizeOrderStatus(payment.status),
        paymentMethod: payment.payment_method_id || order.paymentMethod,
        externalOrderId: providerPaymentId || order.externalOrderId,
        providerResponse: JSON.stringify(payment),
      },
    });
  }
}

async function processWebhook(paymentId?: string | number | null) {
  if (!paymentId) {
    return { ok: true, ignored: true };
  }

  const payment = await fetchPayment(String(paymentId));
  await persistPayment(payment);

  return {
    ok: true,
    paymentId: String(paymentId),
    status: payment.status || null,
    externalReference: payment.external_reference ? String(payment.external_reference) : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('🔥 Webhook Mercado Pago recebido:', body);

    const paymentId = body?.data?.id || body?.id || req.nextUrl.searchParams.get('data.id');
    const result = await processWebhook(paymentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro no webhook POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro no webhook.' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const paymentId =
      req.nextUrl.searchParams.get('data.id') ||
      req.nextUrl.searchParams.get('id');

    const result = await processWebhook(paymentId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro no webhook GET:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro no webhook.' },
      { status: 500 },
    );
  }
}
