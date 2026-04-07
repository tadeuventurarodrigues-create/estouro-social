export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { getProviderConfig, getSiteConfig } from '@/lib/site-config';
import { AdminPanel } from '@/components/admin-panel';
import { formatCurrency } from '@/lib/format';

export default async function AdminPage() {
  const { user } = await requireAdminSession();

  const [services, orders, payments, users, site, provider] = await Promise.all([
    prisma.service.findMany({ orderBy: { id: 'asc' } }),
    prisma.order.findMany({ include: { service: true, user: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.payment.findMany({ include: { order: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    getSiteConfig(),
    getProviderConfig(),
  ]);

  const grossRevenue = payments
    .filter((payment) => payment.status === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <main className="container grid two-col">
      <section className="space-y">
        <section className="card" style={{ padding: 24 }}>
          <div className="badge">Admin protegido</div>
          <h1>Painel admin</h1>
          <p className="muted">Logado como {user.name}. Agora o catálogo, a identidade visual e as APIs podem ser editados aqui.</p>

          <div className="row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: 16, minWidth: 190 }}>
              <div className="muted small">Clientes</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>
                {users.filter((item) => item.role === 'CUSTOMER').length}
              </div>
            </div>
            <div className="card" style={{ padding: 16, minWidth: 190 }}>
              <div className="muted small">Serviços</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{services.length}</div>
            </div>
            <div className="card" style={{ padding: 16, minWidth: 190 }}>
              <div className="muted small">Receita aprovada</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{formatCurrency(grossRevenue)}</div>
            </div>
          </div>
        </section>

        <AdminPanel
          initialSite={{
            brandName: site.brandName,
            siteTitle: site.siteTitle,
            siteDescription: site.siteDescription,
            heroBadge: site.heroBadge,
            heroTitle: site.heroTitle,
            heroDescription: site.heroDescription,
            logoUrl: site.logoUrl || '',
            primaryColor: site.primaryColor,
            secondaryColor: site.secondaryColor,
            accentColor: site.accentColor,
            backgroundColor: site.backgroundColor,
            cardColor: site.cardColor,
            textColor: site.textColor,
          }}
          initialProvider={{
            externalApiUrl: provider.externalApiUrl || '',
            externalApiKey: provider.externalApiKey || '',
            mercadopagoAccessToken: provider.mercadopagoAccessToken || '',
            mercadopagoPublicKey: provider.mercadopagoPublicKey || '',
          }}
          initialServices={services.map((service) => ({
            id: service.id,
            name: service.name,
            category: service.category,
            description: service.description,
            imageUrl: service.imageUrl || '',
            externalServiceId: service.externalServiceId,
            rate: service.rate,
            min: service.min,
            max: service.max,
            enabled: service.enabled,
            fieldsJson: service.fieldsJson,
          }))}
        />
      </section>

      <section className="space-y">
        <div className="card" style={{ padding: 18 }}>
          <strong>Pedidos recentes</strong>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user?.name || order.customerName}</td>
                  <td>{order.service.name}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <strong>Pagamentos recentes</strong>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.providerPaymentId || '-'}</td>
                  <td>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}