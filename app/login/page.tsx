'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('cliente@ventura.local');
  const [password, setPassword] = useState('cliente123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha no login');
      router.push(data.role === 'ADMIN' ? '/admin' : next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 540 }}>
      <section className="card" style={{ padding: 28 }}>
        <div className="badge">V2 com login real</div>
        <h1 style={{ marginTop: 16 }}>Entrar</h1>
        <p className="muted">Acesse como cliente ou admin. O painel é protegido por sessão.</p>

        <form className="space-y" onSubmit={handleSubmit} style={{ marginTop: 22 }}>
          <div>
            <label className="label">E-mail</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error ? <div className="card" style={{ padding: 12, color: '#ffb4b4' }}>{error}</div> : null}
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <div className="card" style={{ padding: 16, marginTop: 20 }}>
          <strong>Contas de teste</strong>
          <div className="muted small" style={{ marginTop: 8 }}>Admin: admin@ventura.local / admin123</div>
          <div className="muted small">Cliente: cliente@ventura.local / cliente123</div>
        </div>

        <p className="muted small" style={{ marginTop: 18 }}>
          Ainda não tem conta? <Link href="/register">Criar cadastro</Link>
        </p>
      </section>
    </main>
  );
}
