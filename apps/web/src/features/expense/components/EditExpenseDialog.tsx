"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  getFirstDateOfMonth,
  getLastDateOfMonth,
  type YearMonth,
} from "@/lib/yearMonth";
import { useOnlineStatus } from "@/features/pwa/hooks/useOnlineStatus";
import { ManageCategoriesDialog } from "@/features/category/components/ManageCategoriesDialog";
import type { Category } from "@/features/category/types/category";
import type { CurrencyCode } from "@/features/currency/currencies";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { useDeleteExpense } from "@/features/expense/hooks/useDeleteExpense";
import { useExpenseFormState } from "@/features/expense/hooks/useExpenseFormState";
import { useUpdateExpense } from "@/features/expense/hooks/useUpdateExpense";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";
import {
  getExpenseChanges,
  getExpenseDateInputValue,
} from "@/features/expense/utils/getExpenseChanges";

type EditExpenseDialogProps = {
  /** The expense being edited; the dialog is open while this is set. */
  expense: ExpenseWithCategory | null;
  onClose: () => void;
  period: YearMonth;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  categories: Category[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  onRetryCategories: () => void;
};

type EditExpenseFormContainerProps = Omit<EditExpenseDialogProps, "expense"> & {
  expense: ExpenseWithCategory;
};

export function EditExpenseDialog({
  expense,
  onClose,
  ...formProps
}: EditExpenseDialogProps) {
  return (
    <Dialog open={expense !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit expense
          </DialogTitle>
          <DialogDescription>
            Change the details or delete this expense.
          </DialogDescription>
        </DialogHeader>
        {/* Keyed by id so switching expenses starts from fresh form state. */}
        {expense && (
          <EditExpenseFormContainer
            key={expense.id}
            expense={expense}
            onClose={onClose}
            {...formProps}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditExpenseFormContainer({
  expense,
  onClose,
  period,
  currency,
  onCurrencyChange,
  categories,
  isCategoriesLoading,
  categoriesError,
  onRetryCategories,
}: EditExpenseFormContainerProps) {
  const { updateExpense, isUpdatingExpense } = useUpdateExpense();
  const { deleteExpense, isDeletingExpense } = useDeleteExpense();
  const isOnline = useOnlineStatus();

  const {
    formValues,
    errors,
    submitError,
    setSubmitError,
    handleChange,
    validate,
  } = useExpenseFormState({
    initialValues: () => ({
      name: expense.name,
      amount: expense.amount.toFixed(2),
      categoryId: expense.categoryId,
      date: getExpenseDateInputValue(expense),
    }),
    categories,
    period,
    fallbackToFirstCategory: false,
  });
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const expenseSummary = `${expense.name} · ${formatCurrency(expense.amount, currency)}`;

  const handleSubmit = () => {
    const payload = validate();
    if (!payload || !isOnline) return;

    const changes = getExpenseChanges(expense, payload);
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setSubmitError(null);
    setDeleteError(null);
    updateExpense(
      { id: expense.id, payload: changes },
      {
        onSuccess: () => {
          toast.success("Expense updated", {
            description: `${payload.name} · ${formatCurrency(payload.amount, currency)}`,
          });
          onClose();
        },
        onError: (error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  const handleConfirmDelete = () => {
    setSubmitError(null);
    setDeleteError(null);
    deleteExpense(expense.id, {
      onSuccess: () => {
        toast.success("Expense deleted", { description: expenseSummary });
        setIsConfirmingDelete(false);
        onClose();
      },
      onError: (error) => {
        setIsConfirmingDelete(false);
        setDeleteError(getErrorMessage(error));
      },
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
        isSubmitting={isUpdatingExpense}
        isOffline={!isOnline}
        submitError={submitError}
        submitLabel="Save changes"
        onDelete={() => setIsConfirmingDelete(true)}
        isDeleting={isDeletingExpense}
        deleteError={deleteError}
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
      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={(open) =>
          !open && !isDeletingExpense && setIsConfirmingDelete(false)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{expense.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {formatCurrency(expense.amount, currency)} will be removed from
              this month. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingExpense}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingExpense}
            >
              {isDeletingExpense ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
