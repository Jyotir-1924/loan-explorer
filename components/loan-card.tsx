"use client";

import { useState } from "react";
import { Product } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "./chat-window";
import { cn } from "@/lib/utils";

interface LoanCardProps {
  product: Product;
  isBestMatch?: boolean;
}

type BadgeConfig = {
  label: string;
  variant: "default" | "secondary" | "outline";
};

export function LoanCard({ product, isBestMatch = false }: LoanCardProps) {
  const [chatOpen, setChatOpen] = useState(false);

  const generateBadges = (): BadgeConfig[] => {
    const badges: BadgeConfig[] = [];

    if (product.rate_apr < 10) {
      badges.push({ label: "Low APR", variant: "default" });
    }

    if (product.prepayment_allowed) {
      badges.push({ label: "No Prepayment Fee", variant: "secondary" });
    }

    if (product.disbursal_speed === "fast") {
      badges.push({ label: "Fast Disbursal", variant: "default" });
    }

    if (product.docs_level === "low") {
      badges.push({ label: "Low Docs", variant: "secondary" });
    }

    if (product.tenure_max_months >= 84) {
      badges.push({ label: "Flexible Tenure", variant: "outline" });
    }

    if (product.processing_fee_pct <= 1) {
      badges.push({ label: "Low Processing Fee", variant: "secondary" });
    }

    if (product.min_income <= 300000) {
      badges.push({
        label: `Salary > ₹${(product.min_income / 1000).toFixed(0)}K Eligible`,
        variant: "outline",
      });
    }

    if (product.min_credit_score <= 700) {
      badges.push({
        label: `Credit Score ≥ ${product.min_credit_score}`,
        variant: "outline",
      });
    }

    return badges.slice(0, 3);
  };

  const badges = generateBadges();

  return (
    <>
      <Card
        className={cn(
          "hover:shadow-lg transition-shadow",
          isBestMatch && "border-2 border-blue-500"
        )}
      >
        <CardHeader>
          {isBestMatch && (
            <Badge className="w-fit mb-2 bg-blue-500">Best Match</Badge>
          )}
          <CardTitle className="flex items-start justify-between">
            <span>{product.name}</span>
            <span className="text-2xl font-bold text-blue-600">
              {product.rate_apr}%
            </span>
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {product.bank}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600">{product.summary}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Min. Income</p>
              <p className="font-semibold">
                ₹{product.min_income.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Min. Credit Score</p>
              <p className="font-semibold">{product.min_credit_score}</p>
            </div>
            <div>
              <p className="text-gray-500">Tenure</p>
              <p className="font-semibold">
                {product.tenure_min_months}-{product.tenure_max_months} months
              </p>
            </div>
            <div>
              <p className="text-gray-500">Processing Fee</p>
              <p className="font-semibold">
                {product.processing_fee_pct}%
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setChatOpen(true)}
          >
            Ask About Product
          </Button>
        </CardFooter>
      </Card>

      <ChatWindow
        product={product}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}
