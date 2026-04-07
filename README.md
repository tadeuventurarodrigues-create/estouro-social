# Ventura Market V2

Starter para **marketplace de serviços digitais** com:

- Next.js 15
- TypeScript
- Prisma + PostgreSQL
- painel admin e painel do cliente
- catálogo e checkout
- Mercado Pago (Pix e Checkout)
- integração com API externa genérica
- deploy pronto para Vercel + Supabase

## Aviso

Use este projeto para **serviços digitais legítimos**. A integração externa é genérica e precisa ser configurada por você conforme o seu provedor e suas regras de uso.

## Stack

- Frontend e backend: Next.js App Router
- Banco: Supabase PostgreSQL
- ORM: Prisma
- Pagamentos: Mercado Pago
- Deploy: Vercel

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

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
AUTH_SECRET="troque-essa-chave-em-producao"
NEXT_PUBLIC_SITE_NAME="Ventura Market"
NEXT_PUBLIC_BASE_URL="https://seu-dominio.com"
EXTERNAL_API_URL="https://seudominio.com/api/v2"
EXTERNAL_API_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""
```

## Supabase

1. Crie um projeto no Supabase.
2. Em **Project Settings > Database**, copie a connection string do PostgreSQL.
3. Cole no `DATABASE_URL`.
4. Rode:

```bash
npx prisma db push
npm run db:seed
```

## Vercel

Adicione no projeto do Vercel estas variáveis:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_BASE_URL`
- `EXTERNAL_API_URL`
- `EXTERNAL_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`

Depois faça o deploy normalmente.

## Dica importante para o Vercel

- Não suba `node_modules`, `.next`, `.env` ou `.git` dentro do ZIP/repositório.
- O projeto já está ajustado para renderizar páginas com banco de forma dinâmica, evitando falhas de build por pré-render estático.

## Contas demo do seed

- Admin: `admin@ventura.local` / `admin123`
- Cliente: `cliente@ventura.local` / `cliente123`

## Fluxo de pagamento

1. Cliente cria pedido.
2. Sistema gera Pix ou Checkout no Mercado Pago.
3. Webhook confirma pagamento.
4. Pedido pode ser encaminhado ao provedor externo.

## Fluxo do webhook

Rotas presentes:

- `app/api/webhooks/mp/route.ts`
- `app/api/webhooks/mercadopago/route.ts`

Use uma só em produção. A recomendada é `app/api/webhooks/mp/route.ts`.
