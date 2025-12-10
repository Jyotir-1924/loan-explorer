"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFilters as FilterTypes, LoanType } from "@/types";

interface LocalFilterState {
  bank: string;
  minApr: number;
  maxApr: number;
  minIncome: number;
  minCreditScore: number;
  type: "all" | LoanType;
}

interface ProductFiltersProps {
  onFilterChange: (filters: Partial<FilterTypes>) => void;
  initialFilters?: Partial<FilterTypes>;
}

const DEFAULT_FILTERS: LocalFilterState = {
  bank: "",
  minApr: 0,
  maxApr: 25,
  minIncome: 0,
  minCreditScore: 600,
  type: "all",
};

export function ProductFilters({
  onFilterChange,
  initialFilters,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<LocalFilterState>({
    ...DEFAULT_FILTERS,
    bank: initialFilters?.bank ?? "",
    minApr: initialFilters?.minApr ?? 0,
    maxApr: initialFilters?.maxApr ?? 25,
    minIncome: initialFilters?.minIncome ?? 0,
    minCreditScore: initialFilters?.minCreditScore ?? 600,
    type: initialFilters?.type ?? "all",
  });

  const handleChange = <K extends keyof LocalFilterState>(
    key: K,
    value: LocalFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const activeFilters: Partial<FilterTypes> = {};
    if (filters.bank) activeFilters.bank = filters.bank;
    if (filters.minApr > 0) activeFilters.minApr = filters.minApr;
    if (filters.maxApr < 25) activeFilters.maxApr = filters.maxApr;
    if (filters.minIncome > 0) activeFilters.minIncome = filters.minIncome;
    if (filters.minCreditScore > 600)
      activeFilters.minCreditScore = filters.minCreditScore;
    if (filters.type !== "all") activeFilters.type = filters.type;
    onFilterChange(activeFilters);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bank">Search Bank</Label>
          <Input
            id="bank"
            placeholder="e.g., HDFC, SBI"
            value={filters.bank}
            onChange={(e) => handleChange("bank", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Loan Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) =>
              handleChange("type", value as LocalFilterState["type"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="credit_line">Credit Line</SelectItem>
              <SelectItem value="debt_consolidation">
                Debt Consolidation
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            APR Range: {filters.minApr}% – {filters.maxApr}%
          </Label>
          <Slider
            min={0}
            max={25}
            step={0.5}
            value={[filters.minApr, filters.maxApr]}
            onValueChange={([min, max]) => {
              handleChange("minApr", min);
              handleChange("maxApr", max);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minIncome">Minimum Income (₹)</Label>
          <Input
            id="minIncome"
            type="number"
            placeholder="e.g., 300000"
            value={filters.minIncome || ""}
            onChange={(e) =>
              handleChange("minIncome", Number(e.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Minimum Credit Score: {filters.minCreditScore}</Label>
          <Slider
            min={600}
            max={850}
            step={10}
            value={[filters.minCreditScore]}
            onValueChange={([value]) => handleChange("minCreditScore", value)}
          />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button type="button" onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
