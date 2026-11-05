import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { EditExpenseDialog } from "@/features/expense/components/EditExpenseDialog";
import type { UpdateExpensePayload } from "@/features/expense/types/expense";
import { makeCategory, makeExpense } from "@/test/fixtures";

type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const updateExpense =
  vi.fn<
    (
      variables: { id: string; payload: UpdateExpensePayload },
      callbacks: MutationCallbacks,
    ) => void
  >();
const deleteExpense =
  vi.fn<(id: string, callbacks: MutationCallbacks) => void>();
const toastSuccess = vi.fn();

vi.mock("@/features/expense/hooks/useUpdateExpense", () => ({
  useUpdateExpense: () => ({ updateExpense, isUpdatingExpense: false }),
}));
vi.mock("@/features/expense/hooks/useDeleteExpense", () => ({
  useDeleteExpense: () => ({ deleteExpense, isDeletingExpense: false }),
}));
vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));
vi.mock("@/features/category/components/ManageCategoriesDialog", () => ({
  ManageCategoriesDialog: () => null,
}));

const food = makeCategory({ id: "cat-food", name: "Food" });
const rent = makeCategory({ id: "cat-rent", name: "Rent" });
const expense = makeExpense({
  id: "exp-1",
  name: "Lunch",
  amount: 12.5,
  category: food,
  date: "2026-11-02T00:00:00.000Z",
});

function renderDialog() {
  const onClose = vi.fn();
  render(
    <EditExpenseDialog
      expense={expense}
      onClose={onClose}
      period={{ year: 2026, month: 11 }}
      currency="PHP"
      onCurrencyChange={vi.fn()}
      categories={[food, rent]}
      isCategoriesLoading={false}
      categoriesError={null}
      onRetryCategories={vi.fn()}
    />,
  );
  return { onClose };
}

describe("EditExpenseDialog", () => {
  beforeEach(() => {
    updateExpense.mockReset();
    deleteExpense.mockReset();
    toastSuccess.mockReset();
  });

  it("opens with the expense's saved values", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: "Edit expense" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toHaveValue("12.50");
    expect(screen.getByLabelText("Description")).toHaveValue("Lunch");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-11-02");
  });

  it("sends only the fields that changed", async () => {
    updateExpense.mockImplementation((_variables, { onSuccess }) =>
      onSuccess?.(),
    );
    const { onClose } = renderDialog();

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateExpense).toHaveBeenCalledWith(
      { id: "exp-1", payload: { amount: 20 } },
      expect.any(Object),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toastSuccess).toHaveBeenCalledWith(
      "Expense updated",
      expect.any(Object),
    );
  });

  it("closes without a request when nothing changed", () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateExpense).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the dialog open and shows the error when saving fails", async () => {
    updateExpense.mockImplementation((_variables, { onError }) =>
      onError?.(new ApiError(404, "Expense not found.")),
    );
    const { onClose } = renderDialog();

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Dinner" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText(/Expense not found\./)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks for confirmation and does nothing when cancelled", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByRole("alertdialog");
    expect(confirm).toHaveTextContent("Delete “Lunch”?");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(deleteExpense).not.toHaveBeenCalled();
  });

  it("deletes the expense after confirmation", async () => {
    deleteExpense.mockImplementation((_id, { onSuccess }) => onSuccess?.());
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByRole("alertdialog");
    fireEvent.click(
      Array.from(confirm.querySelectorAll("button")).find(
        (button) => button.textContent === "Delete",
      ) as HTMLButtonElement,
    );

    expect(deleteExpense).toHaveBeenCalledWith("exp-1", expect.any(Object));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toastSuccess).toHaveBeenCalledWith(
      "Expense deleted",
      expect.any(Object),
    );
  });
});
