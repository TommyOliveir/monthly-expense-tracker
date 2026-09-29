"use client";

import { BudgetModal } from "@/components/modals/BudgetModal";
import { ExpenseModal } from "@/components/modals/EspenseModal";

import { Button } from "@/components/ui/button";
import { useCoinSound } from "@/hooks/use-coin-sound";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../features/auth/AuthProvider";
import { useBudgetSummary } from "../../../features/budget/hooks/useBudgetSummary";
import { useCategories } from "../../../features/category/hooks/useCategories";

export type TxColor = "terracotta" | "amber" | "olive" | "clay";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  method: string;
  initial: string;
  color: TxColor;
  monthYear: string;
};

const colorClasses: Record<TxColor, string> = {
  terracotta: "bg-[#c96f4a]/12 text-[#a4522f]",
  amber: "bg-[#d99a3d]/15 text-[#9a6a1e]",
  olive: "bg-[#7d8c5c]/15 text-[#5a6b3a]",
  clay: "bg-[#8c6a54]/12 text-[#6d4f3c]",
};

const barClasses: Record<TxColor, string> = {
  terracotta: "bg-[#c96f4a]",
  amber: "bg-[#d99a3d]",
  olive: "bg-[#7d8c5c]",
  clay: "bg-[#8c6a54]",
};

const colorCycle: TxColor[] = ["terracotta", "amber", "olive", "clay"];

const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function getCategoryMeta(categoryName: string, index = 0) {
  const color = colorCycle[index % colorCycle.length];
  const initial = categoryName.charAt(0).toUpperCase() || "C";
  return { color, initial };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const initialSeedTransactions: Transaction[] = [
  {
    id: "1",
    name: "Grocery run",
    category: "Markets & dining",
    date: "Sun, Mar 2",
    amount: 86.4,
    method: "Debit ···· 4821",
    initial: "M",
    color: "terracotta",
    monthYear: getCurrentMonthKey(),
  },
  {
    id: "2",
    name: "Spotify Premium",
    category: "Subscriptions",
    date: "Wed, Mar 5",
    amount: 10.99,
    method: "Card ···· 0032",
    initial: "S",
    color: "amber",
    monthYear: getCurrentMonthKey(),
  },
  {
    id: "3",
    name: "Monthly rent",
    category: "Housing",
    date: "Thu, Mar 6",
    amount: 1450,
    method: "Transfer",
    initial: "H",
    color: "olive",
    monthYear: getCurrentMonthKey(),
  },
];

export default function Tracker() {
  const { user } = useAuth();
  const { playCoin } = useCoinSound();
  const { categories } = useCategories();

  const [selectedMonthYear, setSelectedMonthYear] =
    useState<string>(getCurrentMonthKey());

  const [selectedYear, selectedMonth] = useMemo(() => {
    const [y, m] = selectedMonthYear.split("-").map(Number);
    return [y || new Date().getFullYear(), m || new Date().getMonth() + 1];
  }, [selectedMonthYear]);

  // Fetch backend data
  const { budgetSummary, isBudgetSummaryLoading } = useBudgetSummary({
    month: selectedMonth,
    year: selectedYear,
  });

  const [transactions, setTransactions] = useState<Transaction[]>(
    initialSeedTransactions,
  );

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: categories[0]?.name || "Markets & dining",
  });
  // Calculate totals and category breakdown
  const { totalSpent, breakdown, topCategory } = useMemo(() => {
    const list = budgetSummary?.expenses ?? transactions;
    const total =
      budgetSummary?.totalSpent ??
      list.reduce((sum, t) => sum + (t.amount || 0), 0);

    const map = new Map<string, number>();
    for (const t of list) {
      if (!t.category) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + (t.amount || 0));
    }

    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

    return {
      totalSpent: total,
      breakdown: sorted,
      topCategory: sorted[0]?.[0] ?? "—",
    };
  }, [budgetSummary, transactions]);

  const budget = budgetSummary?.budget ?? 8000;
  const remaining = budgetSummary?.remaining ?? budget - totalSpent;
  const percentUsed =
    budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const onTrack = remaining >= 0;

  useEffect(() => {
    playCoin();
  }, [playCoin]);

  const handleSaveBudget = (newBudget: number) => {
    localStorage.setItem("ipon-budget", String(newBudget));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);

    if (!form.name || Number.isNaN(amount) || amount <= 0) return;

    const categoryIdx = categories.indexOf(form.category);
    const meta = getCategoryMeta(
      form.category,
      categoryIdx >= 0 ? categoryIdx : 0,
    );

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      date: "Today",
      amount,
      method: "Card ···· 4821",
      initial: meta.initial,
      color: meta.color,
      monthYear: selectedMonthYear,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setForm({
      name: "",
      amount: "",
      category: categories[0] || "Markets & dining",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#faf5ec] font-sans text-[#2c2115]">
      {/* Background wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/4 size-[620px] rounded-full bg-[#f2c66d]/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-[#e89b6f]/25 blur-3xl" />
        <div className="absolute -bottom-48 left-0 size-[480px] rounded-full bg-[#f6dfa8]/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#2c2115]/15 pb-8">
          <div>
            <h1 className="mb-4 font-display text-3xl font-medium tracking-tight text-[#2c2115]">
              Welcome,{" "}
              <span className="font-semibold text-[#c96f4a]">
                {user?.name || "Member"}
              </span>
            </h1>

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
              <span className="size-2 rounded-full bg-[#c96f4a]" />
              IPON Ledger
              <input
                type="month"
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
                className="rounded-lg border border-[#2c2115]/20 bg-[#fffdf7] px-3 py-1 text-xs font-semibold text-[#2c2115] shadow-sm outline-none transition focus:border-[#c96f4a]"
              />
            </div>

            <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              A month,
              <br />
              <em className="text-[#c96f4a]">beautifully</em> accounted.
            </h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a7a63]">
                Spent so far
              </div>

              <div className="font-display text-4xl font-medium tabular-nums">
                {formatCurrency(totalSpent)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-[#2c2115] px-6 py-3 text-sm font-semibold text-[#faf5ec] shadow-lg shadow-[#c96f4a]/25 transition hover:bg-[#c96f4a]"
            >
              Add expense
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Total spent */}
          <div className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              Total spent
            </div>

            <div className="mt-3 font-display text-4xl font-medium tabular-nums">
              {isBudgetSummaryLoading ? "..." : formatCurrency(totalSpent)}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#c96f4a]/12 px-3 py-1 text-xs font-medium text-[#a4522f]">
              Up 8.2% vs Feb
            </div>
          </div>

          {/* Remaining budget */}
          <div className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              <p>Remaining budget</p>

              <Button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                className="h-auto rounded-full bg-[#2c2115] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#faf5ec] hover:bg-[#c96f4a]"
              >
                Set budget
              </Button>
            </div>

            <div
              className={`mt-3 font-display text-4xl font-medium tabular-nums ${
                remaining < 0 ? "text-[#c96f4a]" : ""
              }`}
            >
              {isBudgetSummaryLoading ? "..." : formatCurrency(remaining)}
            </div>

            <div
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                onTrack
                  ? "bg-[#7d8c5c]/15 text-[#5a6b3a]"
                  : "bg-[#c96f4a]/12 text-[#a4522f]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  onTrack ? "bg-[#7d8c5c]" : "bg-[#c96f4a]"
                }`}
              />
              {onTrack ? "On track" : "Over budget"}
            </div>
          </div>

          {/* Top category */}
          <div className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              Top category
            </div>

            <div className="mt-3 truncate font-display text-3xl font-medium">
              {isBudgetSummaryLoading ? "..." : topCategory}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#d99a3d]/15 px-3 py-1 text-xs font-medium text-[#9a6a1e]">
              {breakdown[0] && totalSpent > 0
                ? `${Math.round((breakdown[0][1] / totalSpent) * 100)}% of total`
                : "—"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-2xl border border-[#2c2115]/15 bg-gradient-to-r from-[#f6dfa8]/70 via-[#f2c66d]/50 to-[#e89b6f]/40 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#6d4f3c]">
            <span className="uppercase tracking-[0.2em]">Budget used</span>

            <span className="tabular-nums">
              {percentUsed}% of {formatCurrency(budget)}
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#2c2115]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d99a3d] to-[#c96f4a] transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-7 shadow-sm backdrop-blur-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">
                Recent activity
              </h2>

              <a
                href="#"
                className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a4522f] transition hover:text-[#2c2115]"
              >
                View all
              </a>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-dashed divide-[#2c2115]/15">
              {(budgetSummary?.expenses && budgetSummary.expenses.length > 0
                ? budgetSummary.expenses
                : transactions
              ).map((t, idx) => {
                const category = t.category || "General";
                const categoryIdx = categories.indexOf(category);
                const meta = getCategoryMeta(
                  category,
                  categoryIdx >= 0 ? categoryIdx : idx,
                );

                return (
                  <div
                    key={t.id || idx}
                    className="flex items-center gap-4 py-4"
                  >
                    <div
                      className={`grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold ${colorClasses[meta.color]}`}
                    >
                      {meta.initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {t.name || category}
                      </div>

                      <div className="truncate text-xs text-[#8a7a63]">
                        {t.date || "This month"} · {category}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums text-[#2c2115]">
                        -{formatCurrency(t.amount)}
                      </div>

                      <div className="text-xs text-[#8a7a63]">
                        {t.method || "Card"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown Sidebar */}
          <div className="flex flex-col rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-7 shadow-sm backdrop-blur-sm">
            <h2 className="font-display text-2xl font-medium">Where it went</h2>

            <div className="mt-6 flex flex-col gap-6">
              {breakdown.map(([category, amount], idx) => {
                const meta = getCategoryMeta(category, idx);
                const pct = totalSpent
                  ? Math.round((amount / totalSpent) * 100)
                  : 0;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-2.5 rounded-full ${barClasses[meta.color]}`}
                        />
                        {category}
                      </span>

                      <span className="font-semibold tabular-nums">
                        {formatCurrency(amount)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#2c2115]/10">
                      <div
                        className={`h-full rounded-full ${barClasses[meta.color]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {breakdown.length === 0 && (
                <div className="text-sm text-[#8a7a63]">
                  No spending recorded for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentBudget={budget}
        totalSpent={totalSpent}
        formatCurrency={formatCurrency}
      />

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
      />
    </div>
  );
}
