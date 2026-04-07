import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentUser } from '@/lib/auth';
import { LogoutButton } from '@/components/logout-button';
import { getSiteConfig } from '@/lib/site-config';

export async function Navbar() {
  const auth = await getCurrentUser();
  const config = await getSiteConfig();

  return (
    <nav className="topbar card container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.brandName}
              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)' }}
            />
          ) : null}
          <div>
            <div className="brand">{config.brandName}</div>
            <div className="muted small">{config.siteDescription}</div>
          </div>
        </div>

        <div className="row">
          <Link href="/catalog">Catálogo</Link>
          <Link href="/checkout">Checkout</Link>
          {auth ? (
            <>
              <Link href="/dashboard">Cliente</Link>
              {auth.user.role === 'ADMIN' ? <Link href="/admin">Admin</Link> : null}
              <span className="muted small">{auth.user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/register">Criar conta</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}