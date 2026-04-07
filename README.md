# Ventura Market V2

Starter pronto para rodar localmente como **marketplace de serviços digitais** com:

- Next.js 15
- TypeScript
- Prisma + SQLite local
- tema escuro/claro
- catálogo
- checkout
- painel do cliente protegido
- painel admin protegido
- login, cadastro e logout
- integração genérica com API externa
- integração com Mercado Pago

## Importante

Este projeto foi entregue como **marketplace genérico de serviços digitais**. A estrutura está pronta para você adaptar os produtos e a integração do provedor conforme o seu uso.

## Visual

- fundo roxo/preto futurista
- botões azuis
- cards glassmorphism
- alternância tema claro/escuro
- páginas públicas + dashboard

## Estrutura

```bash
app/
  api/
    auth/
      login/
      logout/
      register/
    orders/
    payments/
      pix/
      checkout/
    services/
    webhooks/
      mercadopago/
  admin/
  catalog/
  checkout/
  dashboard/
  login/
  register/
  globals.css
  layout.tsx
  page.tsx
components/
  navbar.tsx
  logout-button.tsx
  checkout-form.tsx
lib/
  auth.ts
  session.ts
  password.ts
  external-api.ts
  mercadopago.ts
  prisma.ts
prisma/
  schema.prisma
  seed.js
middleware.ts
```

## Como rodar localmente

### 1) instalar dependências

```bash
npm install
```

### 2) configurar ambiente

Copie o arquivo `.env.example` para `.env`.

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
copy .env.example .env
```

### 3) subir banco local

```bash
npx prisma db push
npm run db:seed
```

### 4) iniciar projeto

```bash
npm run dev
```

Abrir:

```bash
http://localhost:3000
```

## Variáveis

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="troque-essa-chave-em-producao"
NEXT_PUBLIC_SITE_NAME="Ventura Market"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
EXTERNAL_API_URL="https://seudominio.com/api/v2"
EXTERNAL_API_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""
```

## Contas de teste

Depois do seed:

- **Admin:** `admin@ventura.local` / `admin123`
- **Cliente:** `cliente@ventura.local` / `cliente123`

## Autenticação da V2

A V2 já inclui:

- cadastro de cliente
- login de cliente e admin
- cookie de sessão HTTP-only assinado
- logout
- proteção de rotas com `middleware.ts`
- checagem de perfil no servidor para `/dashboard` e `/admin`

Arquivos centrais da autenticação:

- `lib/password.ts`
- `lib/session.ts`
- `lib/auth.ts`
- `middleware.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`

## Integração externa

A lógica está em:

- `lib/external-api.ts`

Funções prontas:

- buscar serviços externos
- criar pedido externo
- consultar status externo

A integração segue o padrão `application/x-www-form-urlencoded`, semelhante ao exemplo PHP enviado anteriormente.

## Mercado Pago

### Pix

Fluxo implementado:

- cliente cria pedido
- backend gera pagamento Pix
- salva QR code/copia e cola no banco
- webhook marca pagamento como aprovado
- backend tenta enviar pedido ao provedor externo

### Cartão

O projeto já deixa pronto o fluxo de checkout com `Preference`, redirecionando para o checkout do Mercado Pago.

Arquivos principais:

- `lib/mercadopago.ts`
- `app/api/orders/route.ts`
- `app/api/webhooks/mercadopago/route.ts`

## Fluxo do sistema

1. Cliente escolhe o serviço
2. Preenche nome, email, link, usuário e quantidade conforme o serviço
3. Escolhe Pix ou checkout/cartão
4. Pedido local é criado
5. Se estiver logado, o pedido fica vinculado ao usuário
6. Pagamento é gerado
7. Webhook confirma
8. Pedido é enviado ao provedor externo
9. Painel mostra status

## Banco de dados

### User
Usuários da plataforma com perfil `ADMIN` ou `CUSTOMER`

### Service
Catálogo do site

### Order
Pedido criado no site, podendo ser vinculado ao usuário autenticado

### Payment
Pagamento vinculado ao pedido

## Limitações atuais

- o middleware verifica presença de sessão para navegação e a validação final do perfil ocorre no servidor
- o webhook do Mercado Pago marca pagamentos aprovados com base no ID recebido; para produção, é recomendado validar assinatura e consultar a API do Mercado Pago para confirmar o status final
- cartão está preparado via checkout do Mercado Pago; checkout transparente completo de cartão pode ser evoluído depois
- a importação automática de serviços do provedor ainda não está pronta no painel

## Próximos passos

- importação automática de serviços do provedor
- status automático do pedido externo
- cupom de desconto
- carteira/saldo interno
- dashboard financeiro completo
- deploy na Vercel + banco em Supabase/Postgres
