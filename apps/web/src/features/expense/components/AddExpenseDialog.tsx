"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoinSound } from "@/hooks/use-coin-sound";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useOnlineStatus } from "@/features/pwa/hooks/useOnlineStatus";
import {
  getDefaultExpenseDate,
  getFirstDateOfMonth,
  getLastDateOfMonth,
  type YearMonth,
} from "@/lib/yearMonth";
import { ManageCategoriesDialog } from "@/features/category/components/ManageCategoriesDialog";
import type { Category } from "@/features/category/types/category";
import type { CurrencyCode } from "@/features/currency/currencies";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { useCreateExpense } from "@/features/expense/hooks/useCreateExpense";
import { useExpenseFormState } from "@/features/expense/hooks/useExpenseFormState";

type AddExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: YearMonth;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  categories: Category[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  onRetryCategories: () => void;
};

type AddExpenseFormContainerProps = Omit<
  AddExpenseDialogProps,
  "open" | "onOpenChange"
> & {
  onClose: () => void;
};

export function AddExpenseDialog({
  open,
  onOpenChange,
  ...formProps
}: AddExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add expense
          </DialogTitle>
          <DialogDescription>
            Record a purchase for {formatMonthLabel(formProps.period)}.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh each time. */}
        <AddExpenseFormContainer
          {...formProps}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddExpenseFormContainer({
  period,
  currency,
  onCurrencyChange,
  categories,
  isCategoriesLoading,
  categoriesError,
  onRetryCategories,
  onClose,
}: AddExpenseFormContainerProps) {
  const { createExpense, isCreatingExpense } = useCreateExpense();
  const isOnline = useOnlineStatus();
  const { playCoin } = useCoinSound();

  const {
    formValues,
    errors,
    submitError,
    setSubmitError,
    handleChange,
    validate,
  } = useExpenseFormState({
    initialValues: () => ({
      name: "",
      amount: "",
      categoryId: "",
      date: getDefaultExpenseDate(period),
    }),
    categories,
    period,
    // Pre-select the first category so the common case needs no extra click.
    fallbackToFirstCategory: true,
  });
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  const handleSubmit = () => {
    const payload = validate();
    if (!payload) return;

    // Don't queue the save: an offline save would wait in memory and be lost
    // if the app closes. The user keeps their input and saves once online.
    if (!isOnline) return;

    setSubmitError(null);
    createExpense(payload, {
      onSuccess: () => {
        playCoin();
        toast.success("Expense added", {
          description: `${payload.name} · ${formatCurrency(payload.amount, currency)}`,
        });
        onClose();
      },
      onError: (error) => setSubmitError(getErrorMessage(error)),
    });
  };

  return (
    <>
      <ExpenseForm
        values={formValues}
        errors={errors}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        categoriesError={categoriesError}
        currency={currency}
        dateRange={{
          min: getFirstDateOfMonth(period),
          max: getLastDateOfMonth(period),
        }}
        isSubmitting={isCreatingExpense}
        isOffline={!isOnline}
        submitError={submitError}
        onChange={handleChange}
        onCurrencyChange={onCurrencyChange}
        onSubmit={handleSubmit}
        onCancel={onClose}
        onManageCategories={() => setIsManagingCategories(true)}
        onRetryCategories={onRetryCategories}
      />
      <ManageCategoriesDialog
        open={isManagingCategories}
        onOpenChange={setIsManagingCategories}
        categories={categories}
        onCategoryCreated={(category) =>
          handleChange("categoryId", category.id)
        }
      />
    </>
  );
}
