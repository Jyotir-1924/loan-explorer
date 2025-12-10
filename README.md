# 🏦 LoanExplorer – Next.js Assignment

LoanExplorer is a simple web application built with **Next.js** that allows users to explore loan products, view personalized recommendations, and ask AI-powered questions about individual loan products.

---

## 🧱 Architecture Overview
```
User (Browser)
    |
    |-- Next.js App Router (Pages & Components)
    |
    |-- Middleware (Authentication & Onboarding Checks)
    |
    |-- API Routes
    |     ├── /api/products → Fetch & filter loan products
    |     ├── /api/user/income → Save user income
    |     └── /api/ai/ask → AI product Q&A
    |
    |-- PostgreSQL (Neon Database)
    |
    |-- Google OAuth (NextAuth)
    |
    |-- Google Gemini API
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd loan-explorer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Initialize the Database
```bash
npm install -D tsx
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏷️ Badge Logic

Each loan product card displays up to **3 dynamic badges** based on its features.

### Badge Conditions

| Badge | Condition |
|-------|-----------|
| **Low APR** | `rate_apr < 10` |
| **No Prepayment Fee** | `prepayment_allowed === true` |
| **Fast Disbursal** | `disbursal_speed === "fast"` |
| **Low Docs** | `docs_level === "low"` |
| **Flexible Tenure** | `tenure_max_months >= 84` |
| **Low Processing Fee** | `processing_fee_pct <= 1` |
| **Salary Eligible** | `min_income <= 300000` |
| **Low Credit Score** | `min_credit_score <= 700` |

### Rules

- Badges are evaluated in priority order
- Only top 3 badges are shown per product
- Keeps the UI clean and readable

---

## 🤖 AI Grounding Strategy

The AI chat is **strictly grounded** to a single loan product to prevent incorrect or hallucinated responses.

### How It Works

1. User asks a question about a loan product
2. Server fetches product data from the database
3. A controlled prompt is built using:
   - Product details
   - FAQs
   - Conversation history
4. AI is instructed to:
   - Use only provided product data
   - Politely decline unrelated questions
5. The response is returned and saved

### Grounding Rules

- ✅ No external knowledge is allowed
- ✅ One product per conversation
- ✅ Out-of-scope questions are politely refused
- ✅ All amounts are formatted in Indian Rupees (₹)

### Example

**User:** "Compare this with SBI loans"

**AI:** "I can only answer questions about this specific loan product."

---

## ✅ What This Assignment Demonstrates

- ✔️ Next.js App Router usage
- ✔️ Secure authentication with middleware
- ✔️ Clean TypeScript data modeling
- ✔️ Zod-based API validation
- ✔️ Database-backed filtering
- ✔️ Product-specific AI integration
- ✔️ Accessible UI using shadcn/ui

---

## 📌 Notes

- All data is stored in a hosted PostgreSQL database
- No client-side mock data or localStorage usage
- Focused on clarity and correctness over complexity

---