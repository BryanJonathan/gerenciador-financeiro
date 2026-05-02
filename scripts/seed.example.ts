/**
 * Template de seed — copie para `seed.local.ts` (gitignored) e ajuste com seus dados.
 * Rodar com: `npm run seed`
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/server/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const rows: schema.NewTransaction[] = [
  {
    type: "income",
    description: "salário",
    amountCents: 500000,
    occurredOn: "2026-05-05",
    bank: "banco x",
    category: null,
  },
  {
    type: "expense",
    description: "almoço",
    amountCents: 3500,
    occurredOn: "2026-05-10",
    bank: "banco x",
    category: "alimentação",
  },
];

async function main() {
  console.log("Limpando tabela transactions…");
  await db.delete(schema.transactions);
  await db.insert(schema.transactions).values(rows);
  console.log(`Inseridas ${rows.length} transações.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
