export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import { requireUserSession } from '@/lib/auth';

export default async function DashboardPage() {
  const { user } = await requireUserSession();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { service: true, payments: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <main className="container">
      <section className="card" style={{ padding: 24 }}>
        <div className="badge">Área protegida</div>
        <h1>Olá, {user.name}</h1>
        <p className="muted">Aqui ficam só os pedidos desse cliente.</p>
        <div className="row" style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 16, minWidth: 200 }}>
            <div className="muted small">Total de pedidos</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{orders.length}</div>
          </div>
          <div className="card" style={{ padding: 16, minWidth: 200 }}>
            <div className="muted small">Total gasto</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{formatCurrency(totalSpent)}</div>
          </div>
          <Link href="/checkout" className="button primary">Novo pedido</Link>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginTop: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Serviço</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.service.name}</td>
                <td>{order.status}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>{order.payments[0]?.status || '-'}</td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={5} className="muted">Nenhum pedido encontrado para esse cliente.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}
