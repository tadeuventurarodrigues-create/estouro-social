import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ServiceGrid } from '@/components/service-grid';
import { getSiteConfig } from '@/lib/site-config';

export default async function HomePage() {
  const [services, config] = await Promise.all([
    prisma.service.findMany({ where: { enabled: true }, orderBy: { id: 'asc' }, take: 3 }),
    getSiteConfig(),
  ]);

  return (
    <main className="container">
      <section className="card hero">
        <div className="badge">{config.heroBadge}</div>
        <h1>{config.heroTitle}</h1>
        <p className="muted">{config.heroDescription}</p>
        <div className="row" style={{ marginTop: 24 }}>
          <Link className="button primary" href="/checkout">
            Comprar agora
          </Link>
          <Link className="button secondary" href="/catalog">
            Ver catálogo
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid kpis">
        {[
          ['Pedidos hoje', '184'],
          ['Pagamentos aprovados', 'R$ 3.420'],
          ['Serviços ativos', String(services.length)],
          ['Automação', '99,2%'],
        ].map(([label, value]) => (
          <div className="card" key={label} style={{ padding: 20 }}>
            <div className="muted small">{label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 10 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2>Catálogo em destaque</h2>
            <p className="muted">Cards rápidos para o cliente comprar em poucos cliques.</p>
          </div>
          <Link href="/catalog" className="button secondary">
            Ver tudo
          </Link>
        </div>
        <ServiceGrid services={services} />
      </section>

      <section style={{ marginTop: 28 }} className="grid two-col">
        <div className="card" style={{ padding: 24 }}>
          <h2>Fluxo do sistema</h2>
          <div className="space-y muted">
            <div>1. Cliente escolhe serviço e preenche formulário.</div>
            <div>2. Backend cria o pedido local e gera pagamento no Mercado Pago.</div>
            <div>3. Webhook confirma pagamento e aprova o pedido.</div>
            <div>4. O sistema envia a solicitação ao provedor externo.</div>
            <div>5. O painel acompanha status e histórico.</div>
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2>O que vem pronto</h2>
          <ul className="muted">
            <li>Catálogo personalizável no admin</li>
            <li>Nome, textos e cores editáveis</li>
            <li>Foto por URL em cada serviço</li>
            <li>Cadastro de cliente</li>
            <li>Pix e checkout</li>
            <li>Integração com API externa</li>
          </ul>
        </div>
      </section>

      <div className="footer container">{config.brandName} • painel configurável pelo admin.</div>
    </main>
  );
}