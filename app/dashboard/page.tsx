import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentUser();

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <section className="card" style={{ padding: 24 }}>
        <div className="badge">Painel</div>
        <h1 style={{ marginTop: 16 }}>Dashboard</h1>

        {session ? (
          <>
            <p className="muted">
              Logado como <strong>{session.user.name}</strong>.
            </p>

            <div className="card" style={{ padding: 16, marginTop: 18 }}>
              <div className="muted small">E-mail</div>
              <div style={{ marginTop: 8 }}>{session.user.email}</div>
            </div>

            <div className="card" style={{ padding: 16, marginTop: 18 }}>
              <div className="muted small">Perfil</div>
              <div style={{ marginTop: 8 }}>{session.user.role}</div>
            </div>
          </>
        ) : (
          <p className="muted">
            Você não está logado. Entre pelo painel de login.
          </p>
        )}
      </section>
    </main>
  );
}