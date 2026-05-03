/**
 * Template de seed — copie para `seed.local.ts` (gitignored) e ajuste com seus dados.
 * Rodar com: `npm run seed -- <user-email>`
 *
 * Pré-requisito: cadastre o usuário em /signup (com convite gerado em /admin/invites)
 * antes de rodar o seed apontando para o email dele.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/server/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const seedEmail = process.env.SEED_USER_EMAIL || process.argv[2];
if (!seedEmail) {
  console.error("Usage: npm run seed -- <user-email>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, seedEmail.trim().toLowerCase()))
    .limit(1);
  if (!user) {
    console.error(`Usuário não encontrado: ${seedEmail}`);
    process.exit(1);
  }

  const rows: schema.NewTransaction[] = [
    {
      userId: user.id,
      type: "income",
      description: "salário",
      amountCents: 500000,
      occurredOn: "2026-05-05",
      bank: "banco x",
      category: null,
    },
    {
      userId: user.id,
      type: "expense",
      description: "almoço",
      amountCents: 3500,
      occurredOn: "2026-05-10",
      bank: "banco x",
      category: "alimentação",
    },
  ];

  console.log(`Limpando transações de ${seedEmail}…`);
  await db
    .delete(schema.transactions)
    .where(eq(schema.transactions.userId, user.id));
  await db.insert(schema.transactions).values(rows);
  console.log(`Inseridas ${rows.length} transações.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
