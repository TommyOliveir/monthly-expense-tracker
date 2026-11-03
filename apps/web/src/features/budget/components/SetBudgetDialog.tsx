"use client";

import { type FormEvent, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  formatCurrency,
  formatMonthLabel,
  getCurrencySymbol,
} from "@/lib/format";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { parseAmount } from "@/lib/money";
import type { YearMonth } from "@/lib/yearMonth";
import { useSetBudget } from "@/features/budget/hooks/useSetBudget";
import type { CurrencyCode } from "@/features/currency/currencies";

type SetBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: YearMonth;
  currentBudget: number;
  totalSpent: number;
  currency: CurrencyCode;
};

type SetBudgetFormProps = Omit<
  SetBudgetDialogProps,
  "open" | "onOpenChange"
> & {
  onSaved: () => void;
};

export function SetBudgetDialog({
  open,
  onOpenChange,
  ...formProps
}: SetBudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        {/* Mounted only while open, so the form starts fresh each time. */}
        <SetBudgetForm {...formProps} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SetBudgetForm({
  period,
  currentBudget,
  totalSpent,
  currency,
  onSaved,
}: SetBudgetFormProps) {
  const { setBudget, isSettingBudget } = useSetBudget();
  const [amountInput, setAmountInput] = useState(
    currentBudget > 0 ? String(currentBudget) : "",
  );
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const monthLabel = formatMonthLabel(period);
  const hasBudget = currentBudget > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = parseAmount(amountInput);
    if (!parsed.ok) {
      setAmountError(parsed.error);
      return;
    }

    setBudget(
      { amount: parsed.value, year: period.year, month: period.month },
      {
        onSuccess: () => {
          toast.success(`Budget for ${monthLabel} saved`, {
            description: formatCurrency(parsed.value, currency),
          });
          onSaved();
        },
        onError: (error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          {hasBudget ? "Edit budget" : "Set budget"}
        </DialogTitle>
        <DialogDescription>
          How much do you plan to spend in {monthLabel}?
        </DialogDescription>
      </DialogHeader>

      <Field data-invalid={amountError ? true : undefined}>
        <FieldLabel htmlFor="budget-amount">Monthly budget</FieldLabel>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <InputGroupText>{getCurrencySymbol(currency)}</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="budget-amount"
            inputMode="decimal"
            autoComplete="off"
            autoFocus
            placeholder="0.00"
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value);
              setAmountError(null);
            }}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={
              amountError ? "budget-amount-error" : "budget-amount-hint"
            }
            className="text-base tabular-nums"
          />
        </InputGroup>
        {amountError ? (
          <FieldError id="budget-amount-error">{amountError}</FieldError>
        ) : (
          <FieldDescription id="budget-amount-hint">
            Already spent this month:{" "}
            <span className="tabular-nums">
              {formatCurrency(totalSpent, currency)}
            </span>
          </FieldDescription>
        )}
      </Field>

      {submitError && (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden />
          <AlertDescription>
            Couldn&apos;t save the budget. {submitError}
          </AlertDescription>
        </Alert>
      )}

      <DialogFooter className="-mx-6 -mb-6 px-6">
        <DialogClose
          render={<Button variant="outline" className="h-10 px-4" />}
          disabled={isSettingBudget}
        >
          Cancel
        </DialogClose>
        <Button type="submit" className="h-10 px-4" disabled={isSettingBudget}>
          {isSettingBudget && <Spinner aria-hidden />}
          {isSettingBudget ? "Saving…" : "Save budget"}
        </Button>
      </DialogFooter>
    </form>
  );
}
