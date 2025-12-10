import { z } from "zod";

export const loanTypeSchema = z.enum([
  "personal",
  "education",
  "vehicle",
  "home",
  "credit_line",
  "debt_consolidation",
]);

export const productFiltersSchema = z.object({
  bank: z.string().optional(),
  minApr: z.number().min(0).max(100).optional(),
  maxApr: z.number().min(0).max(100).optional(),
  minIncome: z.number().min(0).optional(),
  maxIncome: z.number().min(0).optional(),
  minCreditScore: z.number().min(300).max(900).optional(),
  type: loanTypeSchema.optional(),
});

export const chatRequestSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export const updateIncomeSchema = z.object({
  annual_income: z.number().min(0).max(100000000),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type UpdateIncome = z.infer<typeof updateIncomeSchema>;
