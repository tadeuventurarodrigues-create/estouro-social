export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { CheckoutForm } from '@/components/checkout-form';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ serviceId?: string }>; }) {
  const params = await searchParams;
  const serviceId = params.serviceId ? Number(params.serviceId) : undefined;
  const services = await prisma.service.findMany({ where: { enabled: true }, orderBy: { id: 'asc' } });

  return (
    <main className="container grid three-col">
      <section className="card" style={{ padding: 24 }}>
        <h1>Checkout</h1>
        <p className="muted">Preencha os dados, gere Pix ou siga para checkout do cartão.</p>
        <div className="space-y" style={{ marginTop: 18 }}>
          <div className="card" style={{ padding: 18 }}>
            <strong>Campos dinâmicos</strong>
            <p className="muted small">O formulário lê os campos exigidos por cada serviço e monta a interface automaticamente.</p>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <strong>Integração externa</strong>
            <p className="muted small">Depois do pagamento aprovado, o sistema chama a API externa com action=add.</p>
          </div>
        </div>
      </section>
      <CheckoutForm services={services} selectedServiceId={serviceId} />
    </main>
  );
}
