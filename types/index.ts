export type LoanType =
  | "personal"
  | "education"
  | "vehicle"
  | "home"
  | "credit_line"
  | "debt_consolidation";

export type LoanFilterType = LoanType | "all";

export type DisbursalSpeed = "fast" | "standard" | "slow";

export type DocsLevel = "low" | "standard" | "high";

export type ChatRole = "user" | "assistant";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  annual_income: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Product {
  id: string;
  name: string;
  bank: string;
  type: LoanType;
  rate_apr: number;
  min_income: number;
  min_credit_score: number;
  tenure_min_months: number;
  tenure_max_months: number;
  processing_fee_pct: number;
  prepayment_allowed: boolean;
  disbursal_speed: DisbursalSpeed;
  docs_level: DocsLevel;
  summary: string | null;
  faq: FAQ[];
  terms: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  product_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface ProductFilters {
  bank?: string;
  minApr?: number;
  maxApr?: number;
  minIncome?: number;
  maxIncome?: number;
  minCreditScore?: number;
  type?: LoanType;
}

export interface ChatRequest {
  productId: string;
  message: string;
  history?: {
    role: ChatRole;
    content: string;
  }[];
}

export interface ChatResponse {
  response: string;
  error?: string;
}
