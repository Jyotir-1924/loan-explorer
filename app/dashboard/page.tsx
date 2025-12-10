import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserByEmail, getTopProductsForUser } from "@/lib/db";
import { LoanCard } from "@/components/loan-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndianRupee, TrendingUp, Award } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user || !user.onboarding_completed || !user.annual_income) {
    redirect("/onboarding");
  }

  const topProducts = await getTopProductsForUser(user.annual_income);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.display_name || "User"}!
        </h1>
        <p className="text-gray-600">
          Here are your top loan matches based on your profile
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Your Annual Income
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{user.annual_income.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              Used for loan eligibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Loans
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Top matches for you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Best APR Available
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProducts[0]?.rate_apr ?? "N/A"}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lowest interest rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Your Top 5 Loan Matches
        </h2>

        {topProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">
                No loan products match your current income level.
              </p>
              <p className="text-sm text-gray-400">
                Try updating your income or browse all products.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.map((product, index) => (
              <LoanCard
                key={product.id}
                product={product}
                isBestMatch={index === 0}
              />
            ))}
          </div>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Want to see more options?</CardTitle>
          <CardDescription>
            Explore all loan products from top banks across India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 text-sm font-medium"
          >
            Browse All Products
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
