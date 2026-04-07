import { prisma } from '@/lib/prisma';

export type ExternalOrderPayload = {
  service: number;
  link?: string;
  username?: string;
  quantity?: number;
  [key: string]: string | number | undefined;
};

async function getCredentials() {
  const provider = await prisma.providerConfig.findUnique({ where: { id: 1 } });

  const apiUrl = provider?.externalApiUrl || process.env.EXTERNAL_API_URL;
  const apiKey = provider?.externalApiKey || process.env.EXTERNAL_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('API externa não configurada no painel admin nem no .env');
  }

  return { apiUrl, apiKey };
}

async function postForm(data: Record<string, string>) {
  const { apiUrl, apiKey } = await getCredentials();

  const body = new URLSearchParams({ key: apiKey, ...data });
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao conectar no provedor externo: ${res.status}`);
  }

  return res.json();
}

export async function fetchExternalServices() {
  return postForm({ action: 'services' });
}

export async function createExternalOrder(payload: ExternalOrderPayload) {
  return postForm({
    action: 'add',
    ...Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)])),
  });
}

export async function fetchExternalOrderStatus(orderId: string) {
  return postForm({ action: 'status', order: orderId });
}