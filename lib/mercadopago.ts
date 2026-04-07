import crypto from 'node:crypto';

const BASE_URL = 'https://api.mercadopago.com/v1';

function getMercadoPagoToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
  }

  return token;
}

function createIdempotencyKey(prefix: string, externalReference: string) {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${prefix}-${externalReference}-${random}`.slice(0, 64);
}

function getWebhookUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) return undefined;
  if (!baseUrl.startsWith('https://')) return undefined;

  return `${baseUrl}/api/webhook/mp`;
}

export async function createPixPayment({
  amount,
  description,
  externalReference,
  email,
}: {
  amount: number;
  description: string;
  externalReference: string;
  email: string;
}) {
  const token = getMercadoPagoToken();
  const idempotencyKey = createIdempotencyKey('pix', externalReference);
  const webhookUrl = getWebhookUrl();

  const payload: Record<string, unknown> = {
    transaction_amount: Number(amount),
    description,
    payment_method_id: 'pix',
    payer: {
      email,
    },
    external_reference: String(externalReference),
  };

  if (webhookUrl) {
    payload.notification_url = webhookUrl;
  }

  const res = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('MP PIX ERROR:', data);
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}

export async function createCheckoutPreference({
  title,
  amount,
  quantity,
  externalReference,
}: {
  title: string;
  amount: number;
  quantity: number;
  externalReference: string;
}) {
  const token = getMercadoPagoToken();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          title,
          quantity,
          unit_price: Number(amount),
          currency_id: 'BRL',
        },
      ],
      external_reference: String(externalReference),
      back_urls: {
        success: `${baseUrl}/dashboard?payment=success`,
        failure: `${baseUrl}/checkout?payment=failure`,
        pending: `${baseUrl}/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: getWebhookUrl(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('MP CHECKOUT ERROR:', data);
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}