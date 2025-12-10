import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserIncome } from "@/lib/db";
import { updateIncomeSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = updateIncomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const updatedUser = await updateUserIncome(
    session.user.email,
    parsed.data.annual_income
  );
  if (!updatedUser) {
    return NextResponse.json({ error: "Failed to update income" }, { status: 500 });
  }
  return NextResponse.json({ success: true, user: updatedUser });
}
