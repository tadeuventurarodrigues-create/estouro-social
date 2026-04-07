'use client';

import { useMemo, useState } from 'react';
import { PixPayment } from './pix-payment';

type ServiceItem = {
  id: number;
  name: string;
  rate: number;
};

export function CheckoutForm({
  services,
  selectedServiceId,
}: {
  services: ServiceItem[];
  selectedServiceId?: number;
}) {
  const [serviceId, setServiceId] = useState<number>(
    selectedServiceId || services[0]?.id || 0
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [username, setUsername] = useState('');
  const [link, setLink] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'checkout'>('pix');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<null | {
    orderId: number;
    paymentMethod: string;
    pixQrCode?: string;
    pixQrCodeBase64?: string;
    checkoutUrl?: string;
  }>(null);

  const selectedService = useMemo(
    () => services.find((item) => item.id === serviceId),
    [services, serviceId]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!serviceId) {
      setError('Selecione um serviço.');
      return;
    }

    if (!customerName.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }

    if (!customerEmail.trim()) {
      setError('Informe o e-mail.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          customerName,
          customerEmail,
          username,
          link,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar pedido.');
      }

      setResult({
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        pixQrCode: data.pixQrCode,
        pixQrCodeBase64: data.pixQrCodeBase64,
        checkoutUrl: data.checkoutUrl,
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  function closePixModal() {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paymentMethod: '',
        pixQrCode: undefined,
        pixQrCodeBase64: undefined,
      };
    });
  }

  return (
    <>
      <div className="card" style={{ padding: 24 }}>
        <h2>Checkout</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Escolha o serviço, preencha os dados e finalize o pagamento.
        </p>

        <form onSubmit={handleSubmit} className="space-y" style={{ marginTop: 20 }}>
          <div>
            <label className="label">Serviço</label>
            <select
              className="select"
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} • R$ {service.rate.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Nome do cliente</label>
            <input
              className="input"
              placeholder="Seu nome"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              placeholder="cliente@exemplo.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Usuário</label>
            <input
              className="input"
              placeholder="@usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Link</label>
            <input
              className="input"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Pagamento</label>
            <div className="row">
              <label
                className="card"
                style={{
                  padding: 14,
                  flex: 1,
                  cursor: 'pointer',
                  border:
                    paymentMethod === 'pix'
                      ? '1px solid var(--brand-accent)'
                      : '1px solid var(--border)',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'pix'}
                  onChange={() => setPaymentMethod('pix')}
                  style={{ marginRight: 8 }}
                />
                Pix
              </label>

              <label
                className="card"
                style={{
                  padding: 14,
                  flex: 1,
                  cursor: 'pointer',
                  border:
                    paymentMethod === 'checkout'
                      ? '1px solid var(--brand-accent)'
                      : '1px solid var(--border)',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'checkout'}
                  onChange={() => setPaymentMethod('checkout')}
                  style={{ marginRight: 8 }}
                />
                Cartão / Checkout
              </label>
            </div>
          </div>

          {selectedService && (
            <div className="card" style={{ padding: 16 }}>
              <div className="muted small">Resumo</div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>
                {selectedService.name}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Valor: R$ {selectedService.rate.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 14, color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar pedido'}
          </button>
        </form>
      </div>

      {result?.paymentMethod === 'pix' && (
        <PixPayment
          qrCode={result.pixQrCode}
          qrCodeBase64={result.pixQrCodeBase64}
          onClose={closePixModal}
        />
      )}
    </>
  );
}