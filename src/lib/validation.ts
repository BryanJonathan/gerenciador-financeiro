import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const transactionSchema = z.object({
  type: transactionTypeSchema,
  description: z
    .string()
    .trim()
    .min(1, "Descrição obrigatória")
    .max(120, "Máximo 120 caracteres"),
  amountCents: z
    .number({ message: "Valor inválido" })
    .int("Valor inválido")
    .positive("Valor deve ser maior que zero"),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  bank: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v ? v.toLowerCase() : null)),
  category: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v ? v.toLowerCase() : null)),
  notes: z.string().trim().max(500).optional().transform((v) => (v ? v : null)),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha precisa ter ao menos 8 caracteres")
    .max(72, "Senha muito longa"),
});

export const signupSchema = credentialsSchema.extend({
  name: z.string().trim().min(1, "Nome obrigatório").max(80).optional(),
  inviteCode: z.string().trim().min(1, "Código de convite obrigatório"),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
