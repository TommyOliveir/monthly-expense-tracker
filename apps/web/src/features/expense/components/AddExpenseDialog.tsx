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
import {
  formatCurrency,
  formatMonthLabel,
  getCurrencySymbol,
} from "@/lib/format";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  getDefaultExpenseDate,
  getFirstDateOfMonth,
  getLastDateOfMonth,
  type YearMonth,
} from "@/lib/yearMonth";
import { ManageCategoriesDialog } from "@/features/category/components/ManageCategoriesDialog";
import type { Category } from "@/features/category/types/category";
import type { CurrencyCode } from "@/features/currency/currencies";
import {
  ExpenseForm,
  getExpenseFieldId,
} from "@/features/expense/components/ExpenseForm";
import { useCreateExpense } from "@/features/expense/hooks/useCreateExpense";
import type {
  ExpenseFormErrors,
  ExpenseFormField,
  ExpenseFormValues,
} from "@/features/expense/types/expenseForm";
import { validateExpenseForm } from "@/features/expense/utils/validateExpenseForm";

type AddExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: YearMonth;
  currency: CurrencyCode;
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

const FIELD_ORDER: ExpenseFormField[] = [
  "amount",
  "name",
  "categoryId",
  "date",
];

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
  categories,
  isCategoriesLoading,
  categoriesError,
  onRetryCategories,
  onClose,
}: AddExpenseFormContainerProps) {
  const { createExpense, isCreatingExpense } = useCreateExpense();
  const { playCoin } = useCoinSound();

  const [values, setValues] = useState<ExpenseFormValues>(() => ({
    name: "",
    amount: "",
    categoryId: "",
    date: getDefaultExpenseDate(period),
  }));
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  // Fall back to the first category so the common case needs no extra click,
  // including when categories finish loading after the dialog opened.
  const selectedCategoryId =
    values.categoryId &&
    categories.some((category) => category.id === values.categoryId)
      ? values.categoryId
      : (categories[0]?.id ?? "");
  const formValues = { ...values, categoryId: selectedCategoryId };

  const handleChange = (field: ExpenseFormField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = () => {
    const validation = validateExpenseForm(formValues, {
      categoryIds: categories.map((category) => category.id),
      period,
    });

    if (!validation.ok) {
      setErrors(validation.errors);
      const firstInvalidField = FIELD_ORDER.find(
        (field) => validation.errors[field],
      );
      if (firstInvalidField)
        document.getElementById(getExpenseFieldId(firstInvalidField))?.focus();
      return;
    }

    setSubmitError(null);
    createExpense(validation.payload, {
      onSuccess: () => {
        playCoin();
        toast.success("Expense added", {
          description: `${validation.payload.name} · ${formatCurrency(validation.payload.amount, currency)}`,
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
        currencySymbol={getCurrencySymbol(currency)}
        dateRange={{
          min: getFirstDateOfMonth(period),
          max: getLastDateOfMonth(period),
        }}
        isSubmitting={isCreatingExpense}
        submitError={submitError}
        onChange={handleChange}
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
