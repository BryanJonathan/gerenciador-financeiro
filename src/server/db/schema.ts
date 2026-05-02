import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    bank: text("bank"),
    category: text("category"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("transactions_type_check", sql`${t.type} in ('income','expense')`),
    check("transactions_amount_positive", sql`${t.amountCents} > 0`),
    index("transactions_occurred_on_idx").on(t.occurredOn),
    index("transactions_type_occurred_on_idx").on(t.type, t.occurredOn),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionType = "income" | "expense";
