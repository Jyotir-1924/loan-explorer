import { neon } from "@neondatabase/serverless";
import { LoanType, Product  } from "@/types";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      image TEXT,
      annual_income NUMERIC,
      onboarding_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      bank TEXT NOT NULL,
      type TEXT CHECK (type IN ('personal','education','vehicle','home','credit_line','debt_consolidation')) NOT NULL,
      rate_apr NUMERIC NOT NULL,
      min_income NUMERIC NOT NULL,
      min_credit_score INT NOT NULL,
      tenure_min_months INT DEFAULT 6,
      tenure_max_months INT DEFAULT 60,
      processing_fee_pct NUMERIC DEFAULT 0,
      prepayment_allowed BOOLEAN DEFAULT TRUE,
      disbursal_speed TEXT DEFAULT 'standard',
      docs_level TEXT DEFAULT 'standard',
      summary TEXT,
      faq JSONB DEFAULT '[]',
      terms JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ai_chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      role TEXT CHECK (role IN ('user','assistant')) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_type ON products(type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_bank ON products(bank)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_min_income ON products(min_income)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_user_product ON ai_chat_messages(user_id, product_id)`;
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return result[0] || null;
}

export async function upsertUser(data: {
  email: string;
  display_name?: string;
  image?: string;
}) {
  const result = await sql`
    INSERT INTO users (email, display_name, image)
    VALUES (${data.email}, ${data.display_name || null}, ${data.image || null})
    ON CONFLICT (email)
    DO UPDATE SET
      display_name = EXCLUDED.display_name,
      image = EXCLUDED.image,
      updated_at = NOW()
    RETURNING *
  `;
  return result[0];
}

export async function updateUserIncome(email: string, income: number) {
  const result = await sql`
    UPDATE users
    SET annual_income = ${income},
        onboarding_completed = TRUE,
        updated_at = NOW()
    WHERE email = ${email}
    RETURNING *
  `;
  return result[0];
}

export async function getProducts(filters?: {
  bank?: string;
  minApr?: number;
  maxApr?: number;
  minIncome?: number;
  maxIncome?: number;
  minCreditScore?: number;
  type?: LoanType;
}) {
  let query = sql`
    SELECT *
    FROM products
    WHERE 1=1
  `;
  if (filters?.bank) {
    query = sql`${query} AND bank ILIKE ${"%" + filters.bank + "%"}`;
  }
  if (filters?.minApr !== undefined) {
    query = sql`${query} AND rate_apr >= ${filters.minApr}`;
  }
  if (filters?.maxApr !== undefined) {
    query = sql`${query} AND rate_apr <= ${filters.maxApr}`;
  }
  if (filters?.minIncome !== undefined) {
    query = sql`${query} AND min_income <= ${filters.minIncome}`;
  }
  if (filters?.maxIncome !== undefined) {
    query = sql`${query} AND min_income >= ${filters.maxIncome}`;
  }
  if (filters?.minCreditScore !== undefined) {
    query = sql`${query} AND min_credit_score >= ${filters.minCreditScore}`;
  }
  if (filters?.type) {
    query = sql`${query} AND type = ${filters.type}`;
  }
  query = sql`${query} ORDER BY rate_apr ASC`;
  return await query;
}

export async function getTopProductsForUser(
  userIncome: number
): Promise<Product[]> {
  const result = await sql`
    SELECT *
    FROM products
    WHERE min_income <= ${userIncome}
    ORDER BY rate_apr ASC
    LIMIT 5
  `;
  return result as Product[];
}


export async function getProductById(id: string) {
  const result = await sql`
    SELECT * FROM products WHERE id = ${id} LIMIT 1
  `;
  return result[0] || null;
}

export async function saveChatMessage(data: {
  userId: string;
  productId: string;
  role: "user" | "assistant";
  content: string;
}) {
  const result = await sql`
    INSERT INTO ai_chat_messages (user_id, product_id, role, content)
    VALUES (${data.userId}, ${data.productId}, ${data.role}, ${data.content})
    RETURNING *
  `;
  return result[0];
}

export async function getChatHistory(userId: string, productId: string) {
  return await sql`
    SELECT *
    FROM ai_chat_messages
    WHERE user_id = ${userId} AND product_id = ${productId}
    ORDER BY created_at ASC
  `;
}
