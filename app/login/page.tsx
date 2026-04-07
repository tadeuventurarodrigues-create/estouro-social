'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao entrar.');
      }

      window.location.href = data.redirectTo || '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 760, paddingTop: 40 }}>
      <section className="card" style={{ padding: 28 }}>
        <div className="badge">Login simplificado</div>
        <h1 style={{ marginTop: 16 }}>Entrar</h1>
        <p className="muted">
          Acesse o painel admin com credenciais definidas no ambiente.
        </p>

        <form onSubmit={handleSubmit} className="space-y" style={{ marginTop: 24 }}>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>

          {error ? (
            <div className="card" style={{ padding: 14, color: '#ff8a8a' }}>
              {error}
            </div>
          ) : null}

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}