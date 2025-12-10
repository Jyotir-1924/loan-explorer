"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();

  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const annualIncome = Number(income);

    if (!annualIncome || annualIncome <= 0) {
      setError("Please enter a valid annual income");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annual_income: annualIncome }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        if (
          typeof data === "object" &&
          data !== null &&
          "error" in data
        ) {
          setError(String((data as { error: string }).error));
        } else {
          setError("Failed to update income");
        }
        return;
      }

      await update();
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us find the best loan products for you
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income (₹)</Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 500000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                min="0"
                step="1000"
                required
              />
              <p className="text-sm text-gray-500">
                We'll use this to show you loans you're eligible for
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
