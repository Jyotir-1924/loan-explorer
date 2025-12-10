"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, ProductFilters, LoanType } from "@/types";
import { LoanCard } from "@/components/loan-card";
import { ProductFilters as FiltersSidebar } from "@/components/product-filters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLoanType = (value: string): value is LoanType =>
    [
      "personal",
      "education",
      "vehicle",
      "home",
      "credit_line",
      "debt_consolidation",
    ].includes(value);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const filters: Partial<ProductFilters> = {};

    const bank = searchParams.get("bank");
    const minApr = searchParams.get("minApr");
    const maxApr = searchParams.get("maxApr");
    const minIncome = searchParams.get("minIncome");
    const minCreditScore = searchParams.get("minCreditScore");
    const type = searchParams.get("type");

    if (bank) filters.bank = bank;
    if (minApr) filters.minApr = Number(minApr);
    if (maxApr) filters.maxApr = Number(maxApr);
    if (minIncome) filters.minIncome = Number(minIncome);
    if (minCreditScore)
      filters.minCreditScore = Number(minCreditScore);
    if (type && isLoanType(type)) filters.type = type;

    fetchProducts(filters);
  }, [searchParams]);

  const fetchProducts = async (filters?: Partial<ProductFilters>) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters?.bank) params.set("bank", filters.bank);
      if (filters?.minApr !== undefined)
        params.set("minApr", String(filters.minApr));
      if (filters?.maxApr !== undefined)
        params.set("maxApr", String(filters.maxApr));
      if (filters?.minIncome !== undefined)
        params.set("minIncome", String(filters.minIncome));
      if (filters?.minCreditScore !== undefined)
        params.set("minCreditScore", String(filters.minCreditScore));
      if (filters?.type) params.set("type", filters.type);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to fetch products");
        return;
      }

      setProducts(data.products);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: Partial<ProductFilters>) => {
    const params = new URLSearchParams();

    if (filters.bank) params.set("bank", filters.bank);
    if (filters.minApr !== undefined)
      params.set("minApr", String(filters.minApr));
    if (filters.maxApr !== undefined)
      params.set("maxApr", String(filters.maxApr));
    if (filters.minIncome !== undefined)
      params.set("minIncome", String(filters.minIncome));
    if (filters.minCreditScore !== undefined)
      params.set("minCreditScore", String(filters.minCreditScore));
    if (filters.type) params.set("type", filters.type);

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const activeTab = searchParams.get("type") ?? "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("type");
    else params.set("type", value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Loan Products</h1>
        <p className="text-gray-600">
          Explore {products.length} loan products
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FiltersSidebar
            onFilterChange={handleFilterChange}
            initialFilters={{
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
              minCreditScore: searchParams.get("minCreditScore")
                ? Number(searchParams.get("minCreditScore"))
                : undefined,
              type:
                searchParams.get("type") &&
                isLoanType(searchParams.get("type")!)
                  ? (searchParams.get("type") as LoanType)
                  : undefined,
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="credit_line">Credit</TabsTrigger>
              <TabsTrigger value="debt_consolidation">Debt</TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <LoanCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
