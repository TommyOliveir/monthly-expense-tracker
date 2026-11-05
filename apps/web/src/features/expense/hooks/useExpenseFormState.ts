import { useState } from "react";
import type { YearMonth } from "@/lib/yearMonth";
import type { Category } from "@/features/category/types/category";
import { getExpenseFieldId } from "@/features/expense/components/ExpenseForm";
import type { CreateExpensePayload } from "@/features/expense/types/expense";
import type {
  ExpenseFormErrors,
  ExpenseFormField,
  ExpenseFormValues,
} from "@/features/expense/types/expenseForm";
import { validateExpenseForm } from "@/features/expense/utils/validateExpenseForm";

type UseExpenseFormStateOptions = {
  initialValues: () => ExpenseFormValues;
  categories: Category[];
  period: YearMonth;
  /**
   * Pre-select the first category when none (or an unknown one) is chosen.
   * Right for a new expense; wrong when editing, where it would silently
   * change the saved category.
   */
  fallbackToFirstCategory: boolean;
};

const FIELD_ORDER: ExpenseFormField[] = [
  "amount",
  "name",
  "categoryId",
  "date",
];

export function useExpenseFormState({
  initialValues,
  categories,
  period,
  fallbackToFirstCategory,
}: UseExpenseFormStateOptions) {
  const [values, setValues] = useState<ExpenseFormValues>(initialValues);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derived rather than stored, so it also applies when categories finish
  // loading after the dialog opened.
  const hasKnownCategory =
    Boolean(values.categoryId) &&
    categories.some((category) => category.id === values.categoryId);
  const categoryId =
    hasKnownCategory || !fallbackToFirstCategory
      ? values.categoryId
      : (categories[0]?.id ?? "");
  const formValues: ExpenseFormValues = { ...values, categoryId };

  const handleChange = (field: ExpenseFormField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  };

  /** Shows errors and focuses the first invalid field; returns the payload when valid. */
  const validate = (): CreateExpensePayload | null => {
    const validation = validateExpenseForm(formValues, {
      categoryIds: categories.map((category) => category.id),
      period,
    });

    if (validation.ok) return validation.payload;

    setErrors(validation.errors);
    const firstInvalidField = FIELD_ORDER.find(
      (field) => validation.errors[field],
    );
    if (firstInvalidField) {
      document.getElementById(getExpenseFieldId(firstInvalidField))?.focus();
    }
    return null;
  };

  return {
    formValues,
    errors,
    submitError,
    setSubmitError,
    handleChange,
    validate,
  };
}
