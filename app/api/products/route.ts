import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProducts } from "@/lib/db";
import { productFiltersSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchParams = req.nextUrl.searchParams;
  const parsedFilters = productFiltersSchema.safeParse({
    bank: searchParams.get("bank") ?? undefined,
    minApr: searchParams.get("minApr")
      ? Number(searchParams.get("minApr"))
      : undefined,
    maxApr: searchParams.get("maxApr")
      ? Number(searchParams.get("maxApr"))
      : undefined,
    minIncome: searchParams.get("minIncome")
      ? Number(searchParams.get("minIncome"))
      : undefined,
    maxIncome: searchParams.get("maxIncome")
      ? Number(searchParams.get("maxIncome"))
      : undefined,
    minCreditScore: searchParams.get("minCreditScore")
      ? Number(searchParams.get("minCreditScore"))
      : undefined,
    type: searchParams.get("type") ?? undefined,
  });
  if (!parsedFilters.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }
  const products = await getProducts(parsedFilters.data);
  return NextResponse.json({ products });
}
