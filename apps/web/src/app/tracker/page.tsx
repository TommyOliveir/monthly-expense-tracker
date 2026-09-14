"use client";

import { BudgetModal } from "@/components/modals/BudgetModal";
import { ExpenseModal } from "@/components/modals/EspenseModal";

import { Button } from "@/components/ui/button";
import { useCoinSound } from "@/hooks/use-coin-sound";
import { useEffect, useMemo, useState } from "react";

type TxColor = "terracotta" | "amber" | "olive" | "clay";

type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  method: string;
  initial: string;
  color: TxColor;
};

type CategoryMeta = { color: TxColor; initial: string };

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

// Order in which new categories get colors assigned
const colorCycle: TxColor[] = ["terracotta", "amber", "olive", "clay"];

const defaultCategoryMeta: Record<string, CategoryMeta> = {
  "Markets & dining": { color: "terracotta", initial: "G" },
  Subscriptions: { color: "amber", initial: "S" },
  Housing: { color: "olive", initial: "U" },
  Transport: { color: "clay", initial: "T" },
};

const initialSeedTransactions: Transaction[] = [
  {
    id: "1",
    name: "Grocery run",
    category: "Markets & dining",
    date: "Sun, Mar 2",
    amount: 86.4,
    method: "Debit ···· 4821",
    initial: "G",
    color: "terracotta",
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
  },
  {
    id: "3",
    name: "Monthly rent",
    category: "Housing",
    date: "Thu, Mar 6",
    amount: 1450,
    method: "Transfer",
    initial: "U",
    color: "olive",
  },
  {
    id: "4",
    name: "Coffee & croissant",
    category: "Markets & dining",
    date: "Sat, Mar 8",
    amount: 14.2,
    method: "Debit ···· 4821",
    initial: "C",
    color: "terracotta",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function Tracker() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialSeedTransactions,
  );

  // Categories — stateful so users can add their own
  const [categoryMeta, setCategoryMeta] =
    useState<Record<string, CategoryMeta>>(defaultCategoryMeta);

  // Expense modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Budget modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Budget
  const [budget, setBudget] = useState(8000);
  const [budgetInput, setBudgetInput] = useState("8000");

  const handleSaveBudget = (newBudget: number) => {
    setBudget(newBudget);
    localStorage.setItem("ipon-budget", String(newBudget));
  };

  // Expense form
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Markets & dining",
  });

  /*
   * Helper to update localStorage with non-default categories
   */
  function persistCustomCategories(categories: Record<string, CategoryMeta>) {
    const custom: Record<string, CategoryMeta> = {};
    for (const key of Object.keys(categories)) {
      if (!defaultCategoryMeta[key]) {
        custom[key] = categories[key];
      }
    }
    localStorage.setItem("ipon-categories", JSON.stringify(custom));
  }

  /*
   * Add a new category
   */
  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCategoryMeta((prev) => {
      if (prev[trimmed]) return prev;

      const nextMeta: CategoryMeta = {
        color: colorCycle[Object.keys(prev).length % colorCycle.length],
        initial: trimmed.charAt(0).toUpperCase(),
      };

      const updated = { ...prev, [trimmed]: nextMeta };
      persistCustomCategories(updated);
      return updated;
    });
  }

  /*
   * Edit a custom category name
   */
  function editCategory(oldName: string, newName: string) {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew || defaultCategoryMeta[oldName]) {
      return; // Protect default categories & ignore invalid names
    }

    setCategoryMeta((prev) => {
      if (!prev[oldName]) return prev;

      const meta = prev[oldName];
      const updated = { ...prev };
      delete updated[oldName];

      updated[trimmedNew] = {
        ...meta,
        initial: trimmedNew.charAt(0).toUpperCase(),
      };

      persistCustomCategories(updated);
      return updated;
    });

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.category === oldName ? { ...tx, category: trimmedNew } : tx,
      ),
    );
  }

  /*
   * Delete a custom category
   */
  function deleteCategory(name: string) {
    if (defaultCategoryMeta[name]) return; // Protect default categories

    setCategoryMeta((prev) => {
      const updated = { ...prev };
      delete updated[name];
      persistCustomCategories(updated);
      return updated;
    });

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.category === name ? { ...tx, category: "Markets & dining" } : tx,
      ),
    );
  }

  /*
   * Load saved budget + custom categories from localStorage
   */
  useEffect(() => {
    const savedBudget = localStorage.getItem("ipon-budget");

    if (savedBudget) {
      const parsedBudget = Number(savedBudget);

      if (!Number.isNaN(parsedBudget) && parsedBudget > 0) {
        setBudget(parsedBudget);
        setBudgetInput(String(parsedBudget));
      }
    }

    const savedCategories = localStorage.getItem("ipon-categories");

    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories) as Record<
          string,
          CategoryMeta
        >;
        setCategoryMeta((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  /*
   * Calculate spending information
   */
  const { totalSpent, breakdown, topCategory } = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();

    for (const t of transactions) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }

    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

    return {
      totalSpent: total,
      breakdown: sorted,
      topCategory: sorted[0]?.[0] ?? "—",
    };
  }, [transactions]);

  /*
   * Budget calculations
   */
  const remaining = budget - totalSpent;

  const percentUsed =
    budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  const onTrack = remaining >= 0;

  /*
   * Coin sound (Runs on mount)
   */
  const { playCoin } = useCoinSound();

  useEffect(() => {
    playCoin();
  }, []);

  /*
   * Open budget modal
   */
  function openBudgetModal() {
    setBudgetInput(String(budget));
    setIsBudgetModalOpen(true);
  }

  /*
   * Add expense
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amount = parseFloat(form.amount);

    if (!form.name || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const meta = categoryMeta[form.category] ?? {
      color: "terracotta" as const,
      initial: form.name.charAt(0).toUpperCase(),
    };

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      date: "Today",
      amount,
      method: "Card ···· 4821",
      initial: meta.initial,
      color: meta.color,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setForm({
      name: "",
      amount: "",
      category: "Markets & dining",
    });

    setIsModalOpen(false);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#faf5ec] font-sans text-[#2c2115]">
      {/* Sunlit wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/4 size-[620px] rounded-full bg-[#f2c66d]/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-[#e89b6f]/25 blur-3xl" />
        <div className="absolute -bottom-48 left-0 size-[480px] rounded-full bg-[#f6dfa8]/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        {/* Masthead */}
        <header className="vault-rise vault-rise-1 flex flex-wrap items-end justify-between gap-6 border-b border-[#2c2115]/15 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
              <span className="size-2 rounded-full bg-[#c96f4a]" />
              IPON Ledger · March 2025
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

        {/* Gallery stat frames */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Total spent */}
          <div className="vault-rise vault-rise-2 rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              Total spent
            </div>

            <div className="mt-3 font-display text-4xl font-medium tabular-nums">
              {formatCurrency(totalSpent)}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#c96f4a]/12 px-3 py-1 text-xs font-medium text-[#a4522f]">
              Up 8.2% vs Feb
            </div>
          </div>

          {/* Remaining budget */}
          <div className="vault-rise vault-rise-3 rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              <p>Remaining budget</p>

              <Button
                type="button"
                onClick={openBudgetModal}
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
              {formatCurrency(remaining)}
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
          <div className="vault-rise vault-rise-4 rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7a63]">
              Top category
            </div>

            <div className="mt-3 truncate font-display text-3xl font-medium">
              {topCategory}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#d99a3d]/15 px-3 py-1 text-xs font-medium text-[#9a6a1e]">
              {breakdown[0]
                ? `${Math.round((breakdown[0][1] / totalSpent) * 100)}% of total`
                : "—"}
            </div>
          </div>
        </div>

        {/* Budget ribbon */}
        <div className="vault-rise vault-rise-2 rounded-2xl border border-[#2c2115]/15 bg-gradient-to-r from-[#f6dfa8]/70 via-[#f2c66d]/50 to-[#e89b6f]/40 p-5">
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

        {/* Lower grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Transactions */}
          <div className="vault-rise vault-rise-3 rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-7 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] backdrop-blur-sm lg:col-span-2">
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
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-4">
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold ${colorClasses[t.color]}`}
                  >
                    {t.initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {t.name}
                    </div>

                    <div className="truncate text-xs text-[#8a7a63]">
                      {t.date} · {t.category}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-[#2c2115]">
                      -{formatCurrency(t.amount)}
                    </div>

                    <div className="text-xs text-[#8a7a63]">{t.method}</div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="py-8 text-center text-sm text-[#8a7a63]">
                  No transactions yet. Add your first expense.
                </div>
              )}
            </div>
          </div>

          {/* Breakdown */}
          <div className="vault-rise vault-rise-4 flex flex-col rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-7 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] backdrop-blur-sm">
            <h2 className="font-display text-2xl font-medium">Where it went</h2>

            <div className="mt-6 flex flex-col gap-6">
              {breakdown.map(([category, amount]) => {
                const meta = categoryMeta[category] ?? {
                  color: "terracotta" as const,
                  initial: category.charAt(0).toUpperCase(),
                };

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
                  No spending yet this month.
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-[#d99a3d]/30 bg-[#f6dfa8]/40 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a6a1e]">
                  Curator's note
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-[#6d4f3c]">
                  {topCategory === "Markets & dining"
                    ? "Dining is up 12% this month. A $300 cap keeps you under budget."
                    : topCategory === "Housing"
                      ? "Housing makes up the largest share of your budget this month."
                      : "Track consistently to spot spending patterns early."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="vault-rise vault-rise-4 flex items-center justify-between border-t border-[#2c2115]/15 pt-6 text-[11px] uppercase tracking-[0.2em] text-[#8a7a63]">
          <span>IPON Ledger</span>
          <span>Est. 2025 · Budapest</span>
        </footer>
      </div>

      {/* SET BUDGET MODAL */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentBudget={budget}
        totalSpent={totalSpent}
        formatCurrency={(amount) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
        }
      />

      {/* ADD EXPENSE MODAL */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        categories={Object.keys(categoryMeta)}
        defaultCategories={Object.keys(defaultCategoryMeta)}
        onAddCategory={addCategory}
        onEditCategory={editCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}
