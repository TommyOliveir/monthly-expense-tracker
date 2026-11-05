import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { formatCurrency } from "@/lib/format";
import type { CurrencyCode } from "@/features/currency/currencies";
import { getCurrentYearMonth, toLocalDateInputValue } from "@/lib/yearMonth";
import { AddExpenseDialog } from "@/features/expense/components/AddExpenseDialog";
import type { CreateExpensePayload } from "@/features/expense/types/expense";
import { makeCategory } from "@/test/fixtures";

type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const createExpense =
  vi.fn<
    (payload: CreateExpensePayload, callbacks: MutationCallbacks) => void
  >();
let isCreatingExpense = false;
const playCoin = vi.fn();
const toastSuccess = vi.fn();

vi.mock("@/features/expense/hooks/useCreateExpense", () => ({
  useCreateExpense: () => ({ createExpense, isCreatingExpense }),
}));
vi.mock("@/hooks/use-coin-sound", () => ({
  useCoinSound: () => ({ playCoin }),
}));
vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));
vi.mock("@/features/category/components/ManageCategoriesDialog", () => ({
  ManageCategoriesDialog: () => null,
}));

const categories = [
  makeCategory({ id: "cat-food", name: "Food" }),
  makeCategory({ id: "cat-rent", name: "Rent" }),
];

function setConnection(isOnline: boolean) {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
  act(() => {
    window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
  });
}

type AddExpenseDialogProps = Parameters<typeof AddExpenseDialog>[0];

type DialogWithCurrencyStateProps = Omit<
  AddExpenseDialogProps,
  "currency" | "onCurrencyChange"
> & {
  initialCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
};

// Mirrors the tracker: the dialog reads and writes one app-wide currency.
function DialogWithCurrencyState({
  initialCurrency,
  onCurrencyChange,
  ...props
}: DialogWithCurrencyStateProps) {
  const [currency, setCurrency] = useState(initialCurrency);

  return (
    <AddExpenseDialog
      {...props}
      currency={currency}
      onCurrencyChange={(next) => {
        onCurrencyChange(next);
        setCurrency(next);
      }}
    />
  );
}

function renderDialog(overrides: Partial<AddExpenseDialogProps> = {}) {
  const onOpenChange = vi.fn();
  const onRetryCategories = vi.fn();
  render(
    <AddExpenseDialog
      open
      onOpenChange={onOpenChange}
      period={getCurrentYearMonth()}
      currency="PHP"
      onCurrencyChange={vi.fn()}
      categories={categories}
      isCategoriesLoading={false}
      categoriesError={null}
      onRetryCategories={onRetryCategories}
      {...overrides}
    />,
  );
  return {
    onOpenChange,
    onRetryCategories,
    dialog: screen.getByRole("dialog"),
  };
}

describe("AddExpenseDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("offline", () => {
    it("blocks saving while offline and keeps what the user typed", () => {
      setConnection(false);
      const { dialog } = renderDialog();

      expect(within(dialog).getByText("You're offline")).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Amount"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "Coffee" },
      });
      const saveButton = screen.getByRole("button", { name: "Save expense" });
      expect(saveButton).toBeDisabled();

      // Enter in a field submits the form even with the button disabled.
      fireEvent.submit(saveButton.closest("form") as HTMLFormElement);
      expect(createExpense).not.toHaveBeenCalled();

      setConnection(true);

      expect(within(dialog).queryByText("You're offline")).toBeNull();
      expect(screen.getByLabelText("Description")).toHaveValue("Coffee");
      fireEvent.click(screen.getByRole("button", { name: "Save expense" }));
      expect(createExpense).toHaveBeenCalledTimes(1);
    });

    it("says it's waiting when a save is paused by a dropped connection", () => {
      isCreatingExpense = true;
      setConnection(false);
      renderDialog();

      expect(
        screen.getByRole("button", { name: "Waiting for connection…" }),
      ).toBeDisabled();
    });
  });

  beforeEach(() => {
    isCreatingExpense = false;
    createExpense.mockReset();
    playCoin.mockReset();
    toastSuccess.mockReset();
  });

  it("saves a valid expense, then celebrates and closes (happy path)", () => {
    const { onOpenChange, dialog } = renderDialog();

    expect(within(dialog).getByText("₱")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "1,250.50" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Groceries" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "cat-rent" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    expect(createExpense).toHaveBeenCalledTimes(1);
    const [payload, callbacks] = createExpense.mock.calls[0];
    expect(payload).toEqual({
      name: "Groceries",
      amount: 1250.5,
      categoryId: "cat-rent",
      date: toLocalDateInputValue(new Date()),
    });

    callbacks.onSuccess?.();
    expect(playCoin).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Expense added", {
      description: "Groceries · ₱1,250.50",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("changes the app-wide currency from the amount input", async () => {
    const onCurrencyChange = vi.fn();
    render(
      <DialogWithCurrencyState
        open
        onOpenChange={vi.fn()}
        period={getCurrentYearMonth()}
        initialCurrency="PHP"
        onCurrencyChange={onCurrencyChange}
        categories={categories}
        isCategoriesLoading={false}
        categoriesError={null}
        onRetryCategories={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Currency: Philippine Peso. Change currency",
      }),
    );
    expect(
      await screen.findByText(
        "Changes how amounts are shown. Amounts aren't converted.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("menuitemradio", { name: /Hungarian Forint/ }),
    );

    expect(onCurrencyChange).toHaveBeenCalledWith("HUF");
    const dialog = screen.getByRole("dialog", { name: "Add expense" });
    const trigger = within(dialog).getByRole("button", {
      name: "Currency: Hungarian Forint. Change currency",
    });
    expect(trigger).toHaveTextContent("Ft");
    await waitFor(() => expect(screen.getByLabelText("Amount")).toHaveFocus());

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "1500" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Lunch" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    const [payload, callbacks] = createExpense.mock.calls[0];
    expect(payload).not.toHaveProperty("currency");
    callbacks.onSuccess?.();
    expect(toastSuccess).toHaveBeenCalledWith("Expense added", {
      description: `Lunch · ${formatCurrency(1500, "HUF")}`,
    });
  });

  it("defaults to the first category", () => {
    renderDialog();
    expect(screen.getByLabelText("Category")).toHaveValue("cat-food");
  });

  it("shows field errors and does not call the API for invalid input", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    expect(createExpense).not.toHaveBeenCalled();
    expect(screen.getByText("Enter an amount.")).toBeInTheDocument();
    expect(screen.getByText("Describe what you spent on.")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Amount")).toHaveFocus();
  });

  it("clears a field error as soon as the user edits that field", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "5" },
    });

    expect(screen.queryByText("Enter an amount.")).not.toBeInTheDocument();
    expect(screen.getByText("Describe what you spent on.")).toBeInTheDocument();
  });

  it("keeps the dialog open with the server's reason when saving fails", () => {
    const { onOpenChange } = renderDialog();

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Taxi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    act(() =>
      createExpense.mock.calls[0][1].onError?.(
        new ApiError(404, "Selected category does not exist."),
      ),
    );

    expect(
      screen.getByText(
        "Couldn't save the expense. Selected category does not exist.",
      ),
    ).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(playCoin).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Description")).toHaveValue("Taxi");
  });

  it("explains a network failure", () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Taxi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));
    act(() =>
      createExpense.mock.calls[0][1].onError?.(
        new TypeError("Failed to fetch"),
      ),
    );

    expect(screen.getByText(/Can't reach the server/)).toBeInTheDocument();
  });

  it("offers a retry when categories fail to load", () => {
    const { onRetryCategories } = renderDialog({
      categories: [],
      categoriesError: "Can't reach the server.",
    });

    expect(screen.getByLabelText("Category")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetryCategories).toHaveBeenCalled();
  });
});
