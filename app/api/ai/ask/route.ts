import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProductById, saveChatMessage } from "@/lib/db";
import { chatRequestSchema } from "@/lib/validations";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FAQ } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { productId, message, history } = parsed.data;
  const product = await getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productContext = `
You are a helpful loan product assistant. Answer questions ONLY using the information below. If the question is outside this data, say you can only answer questions related to this loan product.

Product Details:
- Name: ${product.name}
- Bank: ${product.bank}
- Type: ${product.type}
- Interest Rate (APR): ${product.rate_apr}%
- Minimum Income Required: ₹${product.min_income.toLocaleString("en-IN")}
- Minimum Credit Score Required: ${product.min_credit_score}
- Loan Tenure: ${product.tenure_min_months} to ${
    product.tenure_max_months
  } months
- Processing Fee: ${product.processing_fee_pct}%
- Prepayment Allowed: ${product.prepayment_allowed ? "Yes" : "No"}
- Disbursal Speed: ${product.disbursal_speed}
- Documentation Level: ${product.docs_level}
- Summary: ${product.summary ?? "N/A"}

${
  product.faq.length > 0
    ? `FAQs:\n${(product.faq as FAQ[])
        .map((faq: FAQ) => `Q: ${faq.q}\nA: ${faq.a}`)
        .join("\n\n")}`
    : ""
}
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const conversation = history ?? [];
  const prompt = `${productContext}\n\n${conversation
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    )
    .join("\n")}\n\nUser: ${message}\nAssistant:`;

  const result = await model.generateContent(prompt);
  const aiResponse = result.response.text();

  await saveChatMessage({
    userId: session.user.id,
    productId,
    role: "user",
    content: message,
  });

  await saveChatMessage({
    userId: session.user.id,
    productId,
    role: "assistant",
    content: aiResponse,
  });

  return NextResponse.json({ response: aiResponse });
}
