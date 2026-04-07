import { prisma } from '@/lib/prisma';
import { ServiceGrid } from '@/components/service-grid';

export default async function CatalogPage() {
  const services = await prisma.service.findMany({
    where: { enabled: true },
    orderBy: { id: 'asc' },
  });

  return (
    <main className="container">
      <section className="card" style={{ padding: 24 }}>
        <div className="badge">Catálogo</div>
        <h1 style={{ marginTop: 16 }}>Todos os serviços</h1>
        <p className="muted">Escolha um serviço, veja os detalhes e siga para a compra.</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <ServiceGrid services={services} />
      </section>
    </main>
  );
}