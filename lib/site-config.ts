import { prisma } from '@/lib/prisma';

export async function getSiteConfig() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 1 },
    });

    return (
      config || {
        id: 1,
        brandName: 'Ventura Market',
        siteTitle: 'Ventura Market',
        siteDescription: 'Marketplace futurista de serviços digitais.',
        heroBadge: 'Tema claro/escuro • API externa • Pix e cartão',
        heroTitle: 'Seu site futurista para vender serviços digitais com checkout e automação.',
        heroDescription:
          'Projeto starter com visual roxo/preto, botões azuis, painel admin, painel cliente, catálogo, checkout e integração pronta para provedor externo e Mercado Pago.',
        logoUrl: null,
        primaryColor: '#7c3aed',
        secondaryColor: '#0f172a',
        accentColor: '#2563eb',
        backgroundColor: '#030712',
        cardColor: '#111827',
        textColor: '#f9fafb',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  } catch {
    return {
      id: 1,
      brandName: 'Ventura Market',
      siteTitle: 'Ventura Market',
      siteDescription: 'Marketplace futurista de serviços digitais.',
      heroBadge: 'Tema claro/escuro • API externa • Pix e cartão',
      heroTitle: 'Seu site futurista para vender serviços digitais com checkout e automação.',
      heroDescription:
        'Projeto starter com visual roxo/preto, botões azuis, painel admin, painel cliente, catálogo, checkout e integração pronta para provedor externo e Mercado Pago.',
      logoUrl: null,
      primaryColor: '#7c3aed',
      secondaryColor: '#0f172a',
      accentColor: '#2563eb',
      backgroundColor: '#030712',
      cardColor: '#111827',
      textColor: '#f9fafb',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getProviderConfig() {
  try {
    const config = await prisma.providerConfig.findUnique({
      where: { id: 1 },
    });

    return (
      config || {
        id: 1,
        externalApiUrl: '',
        externalApiKey: '',
        mercadopagoAccessToken: '',
        mercadopagoPublicKey: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  } catch {
    return {
      id: 1,
      externalApiUrl: '',
      externalApiKey: '',
      mercadopagoAccessToken: '',
      mercadopagoPublicKey: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}