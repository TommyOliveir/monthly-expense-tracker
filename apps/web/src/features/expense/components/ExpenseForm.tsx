import { type FormEvent, useRef } from "react";
import { CircleAlertIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { CategorySelect } from "@/features/category/components/CategorySelect";
import { OfflineSaveNotice } from "@/features/pwa/components/OfflineSaveNotice";
import type { Category } from "@/features/category/types/category";
import { CurrencyInputAddon } from "@/features/currency/components/CurrencyInputAddon";
import type { CurrencyCode } from "@/features/currency/currencies";
import type {
  ExpenseFormErrors,
  ExpenseFormField,
  ExpenseFormValues,
} from "@/features/expense/types/expenseForm";

type ExpenseFormProps = {
  values: ExpenseFormValues;
  errors: ExpenseFormErrors;
  categories: Category[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  currency: CurrencyCode;
  dateRange: { min: string; max: string };
  isSubmitting: boolean;
  isOffline: boolean;
  submitError: string | null;
  /** Idle label of the submit button. */
  submitLabel?: string;
  /** Shows a Delete button when set (edit mode). */
  onDelete?: () => void;
  isDeleting?: boolean;
  deleteError?: string | null;
  onChange: (field: ExpenseFormField, value: string) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onManageCategories: () => void;
  onRetryCategories: () => void;
};

export function getExpenseFieldId(field: ExpenseFormField): string {
  return `expense-${field}`;
}

// A save started just before the connection dropped is paused, not failed.
function getSubmitLabel(
  idleLabel: string,
  isSubmitting: boolean,
  isOffline: boolean,
): string {
  if (!isSubmitting) return idleLabel;
  return isOffline ? "Waiting for connection…" : "Saving…";
}

function getErrorId(field: ExpenseFormField): string {
  return `${getExpenseFieldId(field)}-error`;
}

export function ExpenseForm({
  values,
  errors,
  categories,
  isCategoriesLoading,
  categoriesError,
  currency,
  dateRange,
  isSubmitting,
  isOffline,
  submitError,
  submitLabel = "Save expense",
  onDelete,
  isDeleting = false,
  deleteError = null,
  onChange,
  onCurrencyChange,
  onSubmit,
  onCancel,
  onManageCategories,
  onRetryCategories,
}: ExpenseFormProps) {
  const amountInputRef = useRef<HTMLInputElement>(null);
  const isBusy = isSubmitting || isDeleting;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const invalidProps = (field: ExpenseFormField) =>
    errors[field]
      ? { "aria-invalid": true, "aria-describedby": getErrorId(field) }
      : {};

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FieldGroup className="gap-4">
        <Field data-invalid={errors.amount ? true : undefined}>
          <FieldLabel htmlFor={getExpenseFieldId("amount")}>Amount</FieldLabel>
          <InputGroup className="h-11">
            <CurrencyInputAddon
              value={currency}
              onValueChange={onCurrencyChange}
              inputRef={amountInputRef}
            />
            <InputGroupInput
              ref={amountInputRef}
              id={getExpenseFieldId("amount")}
              inputMode="decimal"
              autoComplete="off"
              autoFocus
              placeholder="0.00"
              value={values.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              className="text-base tabular-nums"
              {...invalidProps("amount")}
            />
          </InputGroup>
          {errors.amount && (
            <FieldError id={getErrorId("amount")}>{errors.amount}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor={getExpenseFieldId("name")}>
            Description
          </FieldLabel>
          <Input
            id={getExpenseFieldId("name")}
            placeholder="e.g. Groceries"
            autoComplete="off"
            maxLength={100}
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            className="h-11"
            {...invalidProps("name")}
          />
          {errors.name && (
            <FieldError id={getErrorId("name")}>{errors.name}</FieldError>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.categoryId ? true : undefined}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor={getExpenseFieldId("categoryId")}>
                Category
              </FieldLabel>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-brand-foreground"
                onClick={onManageCategories}
              >
                <Settings2Icon aria-hidden />
                Manage
              </Button>
            </div>
            <CategorySelect
              id={getExpenseFieldId("categoryId")}
              categories={categories}
              value={values.categoryId}
              onValueChange={(categoryId) => onChange("categoryId", categoryId)}
              disabled={isCategoriesLoading || Boolean(categoriesError)}
              invalid={Boolean(errors.categoryId)}
              describedBy={
                errors.categoryId ? getErrorId("categoryId") : undefined
              }
            />
            {errors.categoryId && (
              <FieldError id={getErrorId("categoryId")}>
                {errors.categoryId}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={errors.date ? true : undefined}>
            <FieldLabel htmlFor={getExpenseFieldId("date")}>Date</FieldLabel>
            <Input
              id={getExpenseFieldId("date")}
              type="date"
              min={dateRange.min}
              max={dateRange.max}
              value={values.date}
              onChange={(event) => onChange("date", event.target.value)}
              className="h-11"
              {...invalidProps("date")}
            />
            {errors.date && (
              <FieldError id={getErrorId("date")}>{errors.date}</FieldError>
            )}
          </Field>
        </div>
      </FieldGroup>

      {categoriesError && (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden />
          <AlertDescription>
            Couldn&apos;t load categories. {categoriesError}
          </AlertDescription>
          <AlertAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRetryCategories}
            >
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {isOffline && (
        <OfflineSaveNotice
          actionLabel={onDelete ? "change this expense" : "save this expense"}
        />
      )}

      {submitError && (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden />
          <AlertDescription>
            Couldn&apos;t save the expense. {submitError}
          </AlertDescription>
        </Alert>
      )}

      {deleteError && (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden />
          <AlertDescription>
            Couldn&apos;t delete the expense. {deleteError}
          </AlertDescription>
        </Alert>
      )}

      <div className="-mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 px-6 sm:flex-row sm:justify-end">
        {onDelete && (
          // Last in the stacked mobile layout, far left on wider screens,
          // so it is never the button under the thumb by default.
          <Button
            type="button"
            variant="destructive"
            className="h-10 px-4 sm:mr-auto"
            onClick={onDelete}
            disabled={isBusy || isOffline}
          >
            {isDeleting ? <Spinner aria-hidden /> : <Trash2Icon aria-hidden />}
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={onCancel}
          disabled={isBusy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 px-4"
          disabled={isBusy || isOffline}
        >
          {isSubmitting && <Spinner aria-hidden />}
          {getSubmitLabel(submitLabel, isSubmitting, isOffline)}
        </Button>
      </div>
    </form>
  );
}
