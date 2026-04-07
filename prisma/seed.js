const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.providerConfig.deleteMany();

  await prisma.siteConfig.create({
    data: {
      id: 1,
      brandName: 'Ventura Market',
      siteTitle: 'Ventura Market',
      siteDescription: 'Marketplace futurista de serviços digitais.',
      heroBadge: 'Tema claro/escuro • API externa • Pix e cartão',
      heroTitle: 'Seu site futurista para vender serviços digitais com checkout e automação.',
      heroDescription:
        'Projeto starter com visual roxo/preto, botões azuis, painel admin, painel cliente, catálogo, checkout e integração pronta para provedor externo e Mercado Pago.',
      primaryColor: '#7c3aed',
      secondaryColor: '#0f172a',
      accentColor: '#2563eb',
      backgroundColor: '#030712',
      cardColor: '#111827',
      textColor: '#f9fafb',
    },
  });

  await prisma.providerConfig.create({
    data: {
      id: 1,
      externalApiUrl: process.env.EXTERNAL_API_URL || '',
      externalApiKey: process.env.EXTERNAL_API_KEY || '',
      mercadopagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      mercadopagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: 'Administrador',
        email: 'admin@ventura.local',
        passwordHash: hashPassword('admin123'),
        role: 'ADMIN',
      },
      {
        name: 'Cliente Demo',
        email: 'cliente@ventura.local',
        passwordHash: hashPassword('cliente123'),
        role: 'CUSTOMER',
      },
    ],
  });

  await prisma.service.createMany({
    data: [
      {
        name: 'Pacote de Gestão de Conteúdo',
        category: 'Social',
        description: 'Publicação, organização e suporte de conteúdo.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
        externalServiceId: 101,
        rate: 39.9,
        min: 1,
        max: 10,
        fieldsJson: JSON.stringify(['username', 'link', 'quantity']),
      },
      {
        name: 'Auditoria de Perfil',
        category: 'Consultoria',
        description: 'Análise técnica de perfil e plano de melhoria.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
        externalServiceId: 102,
        rate: 79.9,
        min: 1,
        max: 5,
        fieldsJson: JSON.stringify(['username', 'link']),
      },
      {
        name: 'Pacote de Tráfego Local',
        category: 'Ads',
        description: 'Estrutura inicial para campanhas locais.',
        imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop',
        externalServiceId: 103,
        rate: 149.9,
        min: 1,
        max: 3,
        fieldsJson: JSON.stringify(['link', 'quantity']),
      },
    ],
  });

  const customer = await prisma.user.findUnique({ where: { email: 'cliente@ventura.local' } });
  const service = await prisma.service.findFirst();

  if (customer && service) {
    await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        username: '@clientedemo',
        link: 'https://example.com/projeto',
        quantity: 1,
        totalAmount: service.rate,
        paymentMethod: 'pix',
        status: 'paid',
        userId: customer.id,
        serviceId: service.id,
        payments: {
          create: {
            amount: service.rate,
            status: 'approved',
            provider: 'mercadopago',
            providerPaymentId: 'demo-payment-1',
          },
        },
      },
    });
  }

  console.log('Seed concluído.');
  console.log('Admin: admin@ventura.local / admin123');
  console.log('Cliente: cliente@ventura.local / cliente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });