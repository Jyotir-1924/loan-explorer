# 🏦 LoanExplorer - AI-Powered Loan Discovery Platform

A modern Next.js application that helps users discover and compare personalized loan products with an AI-powered chatbot assistant.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)

## 🎯 Features

- **🔐 Google OAuth Authentication** - Secure sign-in with NextAuth.js
- **📊 Personalized Dashboard** - Top 5 loan matches based on user income
- **🔍 Advanced Filtering** - Search by bank, APR, income, credit score, and loan type
- **🤖 AI Chat Assistant** - Product-specific Q&A powered by Google Gemini
- **💳 40+ Loan Products** - Across Personal, Home, Education, Vehicle, Credit Line, and Debt Consolidation
- **🎨 Modern UI** - Built with shadcn/ui and Tailwind CSS
- **♿ Accessible** - WCAG compliant components

---

## 🏗️ System Architecture
```mermaid
graph TB
    subgraph Client["🖥️ CLIENT LAYER"]
        Landing[Landing Page]
        Dashboard[Dashboard Page]
        Products[Products Page]
        Onboarding[Onboarding Page]
        Login[Login Page]
    end

    subgraph NextJS["⚡ NEXT.JS APP ROUTER"]
        Middleware[🛡️ Middleware<br/>Route Protection<br/>Session Validation]
        
        subgraph Pages["Server Pages SSR"]
            DashboardSSR[/dashboard]
            ProductsSSR[/products]
            OnboardingSSR[/onboarding]
        end
        
        subgraph API["API Routes"]
            AuthAPI[/api/auth/*]
            ProductsAPI[/api/products]
            ProductAPI[/api/products/id]
            IncomeAPI[/api/user/income]
            ChatAPI[/api/ai/ask]
        end
    end

    subgraph External["🌐 EXTERNAL SERVICES"]
        NextAuth[NextAuth.js<br/>Google OAuth]
        NeonDB[(Neon PostgreSQL<br/>Database)]
        GeminiAI[Google Gemini<br/>AI API]
    end

    Client --> Middleware
    Middleware --> Pages
    Middleware --> API
    
    Pages --> NeonDB
    API --> NeonDB
    API --> NextAuth
    API --> GeminiAI
    
    AuthAPI --> NextAuth
    ChatAPI --> GeminiAI
    
    NextAuth -.->|JWT Token| Client
    
    style Client fill:#e1f5ff
    style NextJS fill:#fff4e1
    style External fill:#f0f0f0
```

## 📊 Database Schema (ER Diagram)
```mermaid
erDiagram
    USERS ||--o{ AI_CHAT_MESSAGES : creates
    PRODUCTS ||--o{ AI_CHAT_MESSAGES : relates_to
    
    USERS {
        uuid id PK
        text email UK
        text display_name
        text image
        numeric annual_income
        boolean onboarding_completed
        timestamptz created_at
        timestamptz updated_at
    }
    
    PRODUCTS {
        uuid id PK
        text name
        text bank
        text type
        numeric rate_apr
        numeric min_income
        int min_credit_score
        int tenure_min_months
        int tenure_max_months
        numeric processing_fee_pct
        boolean prepayment_allowed
        text disbursal_speed
        text docs_level
        text summary
        jsonb faq
        jsonb terms
        timestamptz created_at
    }
    
    AI_CHAT_MESSAGES {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        text role
        text content
        timestamptz created_at
    }
```

## 🔄 Application Flow Diagrams

### Authentication Flow
```mermaid
sequenceDiagram
    actor User
    participant Client
    participant NextAuth
    participant Google
    participant DB
    
    User->>Client: Click "Sign In"
    Client->>NextAuth: Initiate OAuth
    NextAuth->>Google: Redirect to Google
    Google->>User: Login Prompt
    User->>Google: Enter Credentials
    Google->>NextAuth: Authorization Code
    NextAuth->>Google: Exchange for Tokens
    Google->>NextAuth: Access Token + User Info
    NextAuth->>DB: Upsert User
    DB->>NextAuth: User Record
    NextAuth->>Client: JWT Session Token
    Client->>User: Redirect to Dashboard
```

### Dashboard Data Flow
```mermaid
sequenceDiagram
    actor User
    participant Page
    participant Middleware
    participant DB
    
    User->>Page: Visit /dashboard
    Page->>Middleware: Check Authentication
    
    alt Not Authenticated
        Middleware->>User: Redirect to /login
    else Authenticated but Not Onboarded
        Middleware->>User: Redirect to /onboarding
    else Authenticated & Onboarded
        Middleware->>Page: Allow Access
        Page->>DB: Fetch User Data
        DB->>Page: Return User + Income
        Page->>DB: Query Top 5 Products<br/>(WHERE min_income <= user_income)
        DB->>Page: Return Eligible Products
        Page->>User: Render Dashboard with Loans
    end
```

### AI Chat Flow
```mermaid
sequenceDiagram
    actor User
    participant ChatUI
    participant API
    participant DB
    participant Gemini
    
    User->>ChatUI: Click "Ask About Product"
    ChatUI->>User: Open Chat Window
    User->>ChatUI: Type Question
    ChatUI->>API: POST /api/ai/ask
    API->>DB: Fetch Product Details
    DB->>API: Return Product Data + FAQ
    
    Note over API: Build Context Prompt<br/>with Product Info
    
    API->>Gemini: Send Question + Context
    Gemini->>API: Generate Grounded Response
    
    par Save User Message
        API->>DB: Save User Message
    and Save AI Response
        API->>DB: Save AI Response
    end
    
    API->>ChatUI: Return AI Answer
    ChatUI->>User: Display Response
```

### Product Filtering Flow
```mermaid
graph LR
    A[User Adjusts Filters] --> B{Filter Type}
    B -->|Bank Search| C[ILIKE Query]
    B -->|APR Range| D[rate_apr BETWEEN]
    B -->|Min Income| E[min_income <=]
    B -->|Credit Score| F[min_credit_score <=]
    B -->|Loan Type| G[type =]
    
    C --> H[Build SQL Query]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[(Database)]
    I --> J[Filter Results]
    J --> K[Sort by APR ASC]
    K --> L[Render Product Cards]
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Google OAuth credentials
- Gemini API key

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd loan-explorer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the root directory:
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Get API Keys

#### Google OAuth (Console: https://console.cloud.google.com)
1. Create a new project
2. Enable "Google+ API"
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)

#### Gemini API (https://makersuite.google.com/app/apikey)
1. Sign in with Google account
2. Create API key
3. Copy to `.env.local`

#### Neon Database (https://neon.tech)
1. Create a new project
2. Copy connection string
3. Paste into `DATABASE_URL`

### 5. Initialize Database
```bash
# Install tsx for running TypeScript scripts
npm install -D tsx

# Add seed script to package.json (if not already added)
# "scripts": { "seed": "tsx scripts/seed.ts" }

# Run database seed
npm run seed
```

This will:
- Create all tables (users, products, ai_chat_messages)
- Seed 40 loan products across 6 categories
- Create indexes for performance

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Build for Production
```bash
npm run build
npm start
```

### 8. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Update NEXTAUTH_URL to your production domain
```

---

## 🏷️ Badge Logic

Each loan product card displays **3 dynamic badges** based on product attributes. The badge selection algorithm prioritizes the most attractive features:

### Badge Selection Criteria
```typescript
1. Low APR          → rate_apr < 10%
2. No Prepayment    → prepayment_allowed === true
3. Fast Disbursal   → disbursal_speed === 'fast'
4. Low Docs         → docs_level === 'low'
5. Flexible Tenure  → tenure_max_months >= 84
6. Low Processing   → processing_fee_pct <= 1%
7. Income Eligible  → min_income <= 300000
8. Credit Score     → min_credit_score <= 700
```

### Badge Decision Tree
```mermaid
graph TD
    A[Product Data] --> B{APR < 10%?}
    B -->|Yes| C[Add: Low APR Badge]
    B -->|No| D{Prepayment Allowed?}
    
    C --> D
    D -->|Yes| E[Add: No Prepayment Fee]
    D -->|No| F{Speed = Fast?}
    
    E --> F
    F -->|Yes| G[Add: Fast Disbursal]
    F -->|No| H{Docs = Low?}
    
    G --> H
    H -->|Yes| I[Add: Low Docs]
    H -->|No| J{Tenure >= 84?}
    
    I --> J
    J -->|Yes| K[Add: Flexible Tenure]
    J -->|No| L{Fee <= 1%?}
    
    K --> L
    L -->|Yes| M[Add: Low Processing]
    L -->|No| N{Income <= 300K?}
    
    M --> N
    N -->|Yes| O[Add: Income Eligible]
    N -->|No| P{Credit <= 700?}
    
    O --> P
    P -->|Yes| Q[Add: Credit Score]
    P -->|No| R[End]
    
    Q --> R
    R --> S[Select Top 3 Badges]
    
    style C fill:#90EE90
    style E fill:#87CEEB
    style G fill:#90EE90
    style I fill:#87CEEB
    style K fill:#FFE4B5
    style M fill:#87CEEB
    style O fill:#FFE4B5
    style Q fill:#FFE4B5
    style S fill:#FFD700
```

### Badge Categories

| Badge | Criteria | Variant | Purpose |
|-------|----------|---------|---------|
| **Low APR** | APR < 10% | `default` | Highlights competitive interest rates |
| **No Prepayment Fee** | Prepayment allowed | `secondary` | Shows flexibility in early repayment |
| **Fast Disbursal** | Speed = 'fast' | `default` | Indicates quick loan processing |
| **Low Docs** | Docs level = 'low' | `secondary` | Minimal documentation required |
| **Flexible Tenure** | Max tenure ≥ 84 months | `outline` | Long repayment period available |
| **Low Processing Fee** | Fee ≤ 1% | `secondary` | Reduced upfront costs |
| **Salary > ₹XK Eligible** | Income ≤ 300K | `outline` | Accessibility for mid-income users |
| **Credit Score ≥ Y** | Min score ≤ 700 | `outline` | Lower credit requirements |

### Implementation
```typescript
const generateBadges = () => {
  const badges = [];
  
  // Priority order ensures most important features show first
  if (product.rate_apr < 10) badges.push({ label: 'Low APR', variant: 'default' });
  if (product.prepayment_allowed) badges.push({ label: 'No Prepayment Fee', variant: 'secondary' });
  if (product.disbursal_speed === 'fast') badges.push({ label: 'Fast Disbursal', variant: 'default' });
  if (product.docs_level === 'low') badges.push({ label: 'Low Docs', variant: 'secondary' });
  if (product.tenure_max_months >= 84) badges.push({ label: 'Flexible Tenure', variant: 'outline' });
  if (product.processing_fee_pct <= 1) badges.push({ label: 'Low Processing Fee', variant: 'secondary' });
  if (product.min_income <= 300000) badges.push({ 
    label: `Salary > ₹${(product.min_income / 1000).toFixed(0)}K Eligible`, 
    variant: 'outline' 
  });
  if (product.min_credit_score <= 700) badges.push({ 
    label: `Credit Score ≥ ${product.min_credit_score}`, 
    variant: 'outline' 
  });
  
  return badges.slice(0, 3); // Return top 3 badges only
};
```

### Why 3 Badges?

- **Cognitive Load**: 3 badges provide quick insight without overwhelming users
- **Card Space**: Maintains clean UI on mobile and desktop
- **Decision Making**: Highlights key differentiators for comparison

---

## 🤖 AI Grounding Strategy

Our AI chat uses **strict grounding** to ensure accurate, product-specific responses without hallucinations.

### Grounding Architecture
```mermaid
graph LR
    A[User Question] --> B[Fetch Product<br/>from Database]
    B --> C[Build Context<br/>Template]
    C --> D[Inject Product<br/>Fields + FAQ]
    D --> E[Add Conversation<br/>History]
    E --> F[Send to<br/>Gemini API]
    F --> G{Response Valid?}
    G -->|Yes| H[Save to DB]
    G -->|No| I[Return Error]
    H --> J[Display Answer]
    I --> J
    
    style D fill:#90EE90
    style F fill:#87CEEB
    style H fill:#FFD700
```

### Context Injection Template
```typescript
const productContext = `
You are a helpful loan product assistant. Answer questions ONLY based on 
the following loan product information. If the question is outside this 
information, politely say you can only answer questions about this specific 
loan product.

Product Details:
- Name: ${product.name}
- Bank: ${product.bank}
- Type: ${product.type}
- Interest Rate (APR): ${product.rate_apr}%
- Minimum Income Required: ₹${product.min_income}
- Minimum Credit Score Required: ${product.min_credit_score}
- Loan Tenure: ${product.tenure_min_months} to ${product.tenure_max_months} months
- Processing Fee: ${product.processing_fee_pct}%
- Prepayment Allowed: ${product.prepayment_allowed ? 'Yes' : 'No'}
- Disbursal Speed: ${product.disbursal_speed}
- Documentation Level: ${product.docs_level}
- Summary: ${product.summary}

${product.faq ? `
Frequently Asked Questions:
${product.faq.map(faq => `Q: ${faq.q}\nA: ${faq.a}`).join('\n\n')}
` : ''}

Instructions:
- Answer questions clearly and concisely
- Use Indian Rupee (₹) format for amounts
- If asked about eligibility, refer to minimum income and credit score
- If information is not available, say so politely
- Do not make up information
- Keep responses friendly and professional
`;
```

### Grounding Principles
```mermaid
mindmap
  root((AI Grounding))
    Single Source of Truth
      Database Only
      No External Knowledge
      Product Isolation
    Explicit Boundaries
      Decline Out-of-Scope
      No Cross-Product Comparison
      Clear Limitations
    Format Consistency
      Indian Rupee ₹
      Percentage %
      Date Format
    Context Preservation
      Conversation History
      Multi-turn Support
      Database Persistence
    Error Handling
      Graceful Failures
      Helpful Messages
      Fallback Responses
```

### Anti-Hallucination Measures

1. **Single Source of Truth**
   - Only product data from database is provided
   - No external knowledge allowed
   - Prevents cross-product confusion

2. **Explicit Boundaries**
   - AI instructed to decline questions outside product scope
   - Example: "Can you compare this to HDFC?" → "I can only answer about this specific product"

3. **Format Consistency**
   - All monetary values in ₹ (Indian Rupee)
   - Dates in DD/MM/YYYY
   - Percentages with % symbol

4. **Conversation History**
   - Previous messages included for context
   - Maintains coherent multi-turn conversations
   - Stored in database for audit trail

5. **Fallback Handling**
```typescript
   if (!product) {
     return { error: 'Product not found' };
   }
```

### Example Grounded Responses

| User Question | AI Response | Reasoning |
|--------------|-------------|-----------|
| "What's the interest rate?" | "The interest rate for this loan is 10.5% APR." | ✅ Direct from product data |
| "Can I prepay without penalty?" | "Yes, prepayment is allowed without any charges." | ✅ From prepayment_allowed field |
| "How does this compare to SBI?" | "I can only answer questions about this specific loan product from HDFC Bank." | ✅ Stays within boundaries |
| "What's the weather today?" | "I can only answer questions about this loan product. Please ask about loan features, eligibility, or terms." | ✅ Declines off-topic |

### Validation Flow
```mermaid
stateDiagram-v2
    [*] --> QuestionReceived
    QuestionReceived --> FetchProduct
    FetchProduct --> ValidProduct: Product Found
    FetchProduct --> Error: Not Found
    
    ValidProduct --> BuildContext
    BuildContext --> InjectData
    InjectData --> AddHistory
    AddHistory --> CallGemini
    
    CallGemini --> ValidResponse: Success
    CallGemini --> Error: API Error
    
    ValidResponse --> SaveMessages
    SaveMessages --> ReturnAnswer
    
    Error --> ReturnError
    ReturnAnswer --> [*]
    ReturnError --> [*]
```

---

## 📁 Project Structure
```
loan-explorer/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   │   ├── products/route.ts               # Product listing API
│   │   ├── products/[id]/route.ts          # Single product API
│   │   ├── user/income/route.ts            # Update user income
│   │   └── ai/ask/route.ts                 # AI chat endpoint
│   ├── dashboard/page.tsx                   # Top 5 personalized loans
│   ├── products/page.tsx                    # All products with filters
│   ├── onboarding/page.tsx                  # Income collection
│   ├── login/page.tsx                       # Google OAuth login
│   ├── layout.tsx                           # Root layout with providers
│   └── page.tsx                             # Landing page
├── components/
│   ├── ui/                                  # shadcn/ui components
│   ├── loan-card.tsx                        # Product card with badges
│   ├── chat-window.tsx                      # AI chat interface
│   ├── product-filters.tsx                  # Filter sidebar
│   ├── navbar.tsx                           # Navigation bar
│   └── session-provider.tsx                 # Auth wrapper
├── lib/
│   ├── db.ts                                # Database queries
│   ├── auth.ts                              # NextAuth configuration
│   ├── validations.ts                       # Zod schemas
│   └── utils.ts                             # Utility functions
├── types/
│   └── index.ts                             # TypeScript types
├── scripts/
│   └── seed.ts                              # Database seeding
├── middleware.ts                            # Route protection
└── .env.local                               # Environment variables
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript | Type safety |
| **Database** | PostgreSQL (Neon) | Serverless Postgres |
| **Auth** | NextAuth.js v4 | Google OAuth |
| **AI** | Google Gemini Pro | Product Q&A chatbot |
| **UI Library** | shadcn/ui | Accessible components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Validation** | Zod | Schema validation |
| **Deployment** | Vercel | Serverless hosting |

---

## 🔐 Security Features

- ✅ JWT-based session management
- ✅ Middleware-protected routes
- ✅ SQL injection prevention (parameterized queries)
- ✅ Environment variable encryption
- ✅ HTTPS-only in production
- ✅ CORS configuration
- ✅ Rate limiting on API routes (recommended to add)

---

## 🧪 Testing (Future Enhancement)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

---

## 🚧 Roadmap

- [ ] Add comparison feature (side-by-side products)
- [ ] Email notifications for loan updates
- [ ] Save favorite loans
- [ ] Loan EMI calculator
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for product management
- [ ] Rate limiting on API routes
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Neon](https://neon.tech/) - Serverless Postgres
- [Vercel](https://vercel.com/) - Deployment platform
- [Google Gemini](https://ai.google.dev/) - AI model

---

## 📞 Support

For support, email your.email@example.com or open an issue in the repository.

---

**Made with ❤️ using Next.js and AI**