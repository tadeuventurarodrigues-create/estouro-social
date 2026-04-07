# Ventura Market V2

Starter para marketplace de serviços digitais com:

- Next.js 15
- TypeScript
- Prisma + Supabase Postgres
- painel admin e painel do cliente
- catálogo e checkout
- Mercado Pago (Pix e Checkout)
- integração com API externa genérica
- deploy pronto para Vercel + Supabase

## Rodar localmente

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

No Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Variáveis de ambiente

Use exatamente este padrão no Vercel:

```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres?connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
AUTH_SECRET="troque-essa-chave-em-producao"
NEXT_PUBLIC_SITE_NAME="Ventura Market"
NEXT_PUBLIC_BASE_URL="https://seu-dominio.com"
EXTERNAL_API_URL="https://seudominio.com/api/v2"
EXTERNAL_API_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""
```

## Supabase no Vercel

### DATABASE_URL
- Use a string do **Supabase Connect -> Session pooler**
- Porta **5432**
- Usuário no formato **postgres.PROJECT_REF**
- Inclua `?connection_limit=1&sslmode=require`

### DIRECT_URL
- Use a string do **Supabase Connect -> Direct connection**
- Porta **5432**
- Usuário `postgres`
- Inclua `?sslmode=require`

## Prisma

O `schema.prisma` já está configurado assim:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Seed

Contas demo do seed:

- Admin: `admin@ventura.local` / `admin123`
- Cliente: `cliente@ventura.local` / `cliente123`

## Vercel

1. Adicione as variáveis em **Settings -> Environment Variables**
2. Faça deploy
3. Se o banco estiver vazio, rode localmente:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## Observações

- O ZIP está limpo: sem `.git`, `.next`, `node_modules` e sem `.env`
- O webhook recomendado é `app/api/webhooks/mp/route.ts`
- O `notification_url` do Mercado Pago aponta para `/api/webhooks/mp`
