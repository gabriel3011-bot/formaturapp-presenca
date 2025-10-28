import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .nullable()
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
});

export const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "O nome deve conter apenas letras, espaços, hífens e apóstrofos"
    ),
});

export const justificationSchema = z
  .string()
  .trim()
  .max(1000, "A justificativa deve ter no máximo 1000 caracteres")
  .optional();

export type EventInput = z.infer<typeof eventSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
