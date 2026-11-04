"use client";

import { useMemo, useState } from "react";
import { CircleAlertIcon, PlusIcon } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonthLabel, formatPercent } from "@/lib/format";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  compareYearMonth,
  shiftYearMonth,
  toLocalDateInputValue,
} from "@/lib/yearMonth";
import { BudgetOverviewCard } from "@/features/budget/components/BudgetOverviewCard";
import { SetBudgetDialog } from "@/features/budget/components/SetBudgetDialog";
import { useBudgetSummary } from "@/features/budget/hooks/useBudgetSummary";
import { getBudgetStatus } from "@/features/budget/utils/getBudgetStatus";
import { CategoryBreakdown } from "@/features/category/components/CategoryBreakdown";
import { useCategories } from "@/features/category/hooks/useCategories";
import { buildCategoryBreakdown } from "@/features/category/utils/buildCategoryBreakdown";
import type { CurrencyCode } from "@/features/currency/currencies";
import { AddExpenseDialog } from "@/features/expense/components/AddExpenseDialog";
import { ExpenseList } from "@/features/expense/components/ExpenseList";
import { groupExpensesByDay } from "@/features/expense/utils/groupExpensesByDay";
import { InstallHint } from "@/features/pwa/components/InstallHint";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";
import { AddExpenseBar } from "@/features/tracker/components/AddExpenseBar";
import { StatCard } from "@/features/tracker/components/StatCard";
import { TrackerHeader } from "@/features/tracker/components/TrackerHeader";
import { TrackerContentSkeleton } from "@/features/tracker/components/TrackerSkeleton";
import { useSelectedMonth } from "@/features/tracker/hooks/useSelectedMonth";

type TrackerDashboardProps = {
  firstName?: string;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
};

export function TrackerDashboard({
  firstName,
  currency,
  onCurrencyChange,
}: TrackerDashboardProps) {
  const { selectedMonth, currentMonth, setSelectedMonth } = useSelectedMonth();
  const {
    budgetSummary,
    isBudgetSummaryLoading,
    budgetSummaryError,
    refetchBudgetSummary,
  } = useBudgetSummary(selectedMonth);
  const {
    categories,
    isCategoriesLoading,
    categoriesError,
    refetchCategories,
  } = useCategories();

  const { isInstallHintVisible, dismissInstallHint } = useInstallHint();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);

  const monthComparison = compareYearMonth(selectedMonth, currentMonth);
  const isReadOnly = monthComparison < 0;
  const monthLabel = formatMonthLabel(selectedMonth);

  const expenses = useMemo(
    () => budgetSummary?.expenses ?? [],
    [budgetSummary],
  );
  const breakdown = useMemo(() => buildCategoryBreakdown(expenses), [expenses]);
  const dayGroups = useMemo(
    () => groupExpensesByDay(expenses, toLocalDateInputValue(new Date())),
    [expenses],
  );

  const budget = budgetSummary?.budget ?? 0;
  const totalSpent = budgetSummary?.totalSpent ?? 0;
  const remaining = budgetSummary?.remaining ?? budget - totalSpent;
  const topCategory = breakdown[0];

  const openExpenseDialog = () => setIsExpenseDialogOpen(true);

  const renderContent = () => {
    if (isBudgetSummaryLoading) return <TrackerContentSkeleton />;

    if (budgetSummaryError) {
      return (
        <Alert variant="destructive" className="px-4 py-3">
          <CircleAlertIcon aria-hidden />
          <AlertTitle>Couldn&apos;t load {monthLabel}</AlertTitle>
          <AlertDescription>
            {getErrorMessage(budgetSummaryError)}
          </AlertDescription>
          <AlertAction className="top-2.5 right-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchBudgetSummary()}
            >
              Try again
            </Button>
          </AlertAction>
        </Alert>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <BudgetOverviewCard
          className="lg:col-span-8"
          budget={budget}
          totalSpent={totalSpent}
          remaining={remaining}
          status={getBudgetStatus(budget, totalSpent)}
          currency={currency}
          monthLabel={monthLabel}
          isReadOnly={isReadOnly}
          onEditBudget={() => setIsBudgetDialogOpen(true)}
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-4 lg:grid-cols-1">
          <StatCard
            label="Spent"
            value={formatCurrency(totalSpent, currency)}
            hint={`${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`}
          />
          <StatCard
            label="Top category"
            value={topCategory?.name ?? "—"}
            hint={
              topCategory
                ? `${formatPercent(topCategory.share)} of spending`
                : "No spending yet"
            }
          />
        </div>

        <CategoryBreakdown
          className="self-start lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:row-start-2"
          items={breakdown}
          currency={currency}
        />

        <ExpenseList
          className="lg:col-span-8 lg:col-start-1 lg:row-start-2"
          groups={dayGroups}
          expenseCount={expenses.length}
          currency={currency}
          emptyDescription={
            isReadOnly
              ? `Nothing was recorded in ${monthLabel}.`
              : "Add your first expense to start tracking this month."
          }
          emptyAction={
            isReadOnly ? undefined : (
              <Button className="h-10 px-4" onClick={openExpenseDialog}>
                <PlusIcon aria-hidden />
                Add expense
              </Button>
            )
          }
        />
      </div>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-6 pb-28 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8">
      {isInstallHintVisible && <InstallHint onDismiss={dismissInstallHint} />}

      <TrackerHeader
        firstName={firstName}
        monthLabel={monthLabel}
        isCurrentMonth={monthComparison === 0}
        isReadOnly={isReadOnly}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        onPreviousMonth={() =>
          setSelectedMonth(shiftYearMonth(selectedMonth, -1))
        }
        onNextMonth={() => setSelectedMonth(shiftYearMonth(selectedMonth, 1))}
        onCurrentMonth={() => setSelectedMonth(currentMonth)}
        onAddExpense={openExpenseDialog}
      />

      {renderContent()}

      {!isReadOnly && (
        <>
          <AddExpenseBar onAddExpense={openExpenseDialog} />
          <AddExpenseDialog
            open={isExpenseDialogOpen}
            onOpenChange={setIsExpenseDialogOpen}
            period={selectedMonth}
            currency={currency}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            categoriesError={
              categoriesError ? getErrorMessage(categoriesError) : null
            }
            onRetryCategories={() => refetchCategories()}
          />
          <SetBudgetDialog
            open={isBudgetDialogOpen}
            onOpenChange={setIsBudgetDialogOpen}
            period={selectedMonth}
            currentBudget={budget}
            totalSpent={totalSpent}
            currency={currency}
          />
        </>
      )}
    </main>
  );
}
