# Gerenciador Financeiro

Controle pessoal de gastos e entradas em BRL — Next.js 16 + Neon Postgres + Drizzle.

## Como rodar

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Copiar `.env.example` para `.env.local` e preencher:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
   BASIC_AUTH_USER=<usuário-do-login>
   BASIC_AUTH_PASS=<senha-forte-aqui>
   ```
3. Aplicar migrations no banco:
   ```bash
   npm run db:migrate
   ```
4. (Opcional) Copiar `scripts/seed.example.ts` para `scripts/seed.local.ts`, ajustar e rodar:
   ```bash
   npm run seed
   ```
5. Subir o dev:
   ```bash
   npm run dev
   ```

App em `http://localhost:3000` — login com as credenciais do `.env.local`.

## Scripts úteis

| Script | O que faz |
|---|---|
| `npm run dev` | Dev server com Turbopack |
| `npm run build` / `npm start` | Build + produção |
| `npm run db:generate` | Gera migration Drizzle a partir do schema |
| `npm run db:migrate` | Aplica migrations no Neon |
| `npm run db:push` | Sync direto schema → DB (prototipagem) |
| `npm run db:studio` | UI do Drizzle Studio |
| `npm run seed` | Popula o banco com dados fake |

## Deploy na Vercel

1. Push para um repositório privado no GitHub.
2. Importar o repositório na Vercel.
3. Em **Environment Variables**, adicionar `DATABASE_URL`, `BASIC_AUTH_USER` e `BASIC_AUTH_PASS`.
4. Build automático.

> Não precisa conectar Neon pelo marketplace — a `DATABASE_URL` manual já basta. O `.npmrc` na raiz força o registry público (caso esteja num ambiente com registry corporativo).

## Estrutura

```
src/
  app/                  rotas (App Router) em pt-BR
    page.tsx            dashboard
    transacoes/         lista + nova + editar
    relatorios/
    configuracoes/
    api/export/         download CSV
  components/           UI + charts + form
    ui/                 shadcn/ui
  lib/                  módulos puros (money, dates, validation, format)
  server/
    db/                 schema Drizzle + cliente Neon
    transactions/       repository + server actions
    reports/            agregações
    suggestions.ts      autocomplete (banks/categories)
  proxy.ts              Basic Auth
drizzle/                migrations geradas
scripts/seed.ts         seed de exemplo
```
