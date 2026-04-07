export const dynamic = 'force-dynamic';
import './globals.css';
import { ReactNode } from 'react';
import { ThemeScript } from '@/components/theme-script';
import { Navbar } from '@/components/navbar';
import { getSiteConfig } from '@/lib/site-config';

export async function generateMetadata() {
  const config = await getSiteConfig();

  return {
    title: config.siteTitle,
    description: config.siteDescription,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await getSiteConfig();

  return (
    <html lang="pt-BR" data-theme="dark">
      <body
        style={
          {
            '--brand-primary': config.primaryColor,
            '--brand-secondary': config.secondaryColor,
            '--brand-accent': config.accentColor,
            '--brand-background': config.backgroundColor,
            '--brand-card': config.cardColor,
            '--brand-text': config.textColor,
          } as React.CSSProperties
        }
      >
        <ThemeScript />
        <Navbar />
        {children}
      </body>
    </html>
  );
}