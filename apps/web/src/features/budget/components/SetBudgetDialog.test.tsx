import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { SetBudgetDialog } from "@/features/budget/components/SetBudgetDialog";
import type { SetBudgetPayload } from "@/features/budget/types/budget";

type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const setBudget =
  vi.fn<(payload: SetBudgetPayload, callbacks: MutationCallbacks) => void>();
let isSettingBudget = false;
const toastSuccess = vi.fn();

vi.mock("@/features/budget/hooks/useSetBudget", () => ({
  useSetBudget: () => ({ setBudget, isSettingBudget }),
}));
vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));

function setConnection(isOnline: boolean) {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
  act(() => {
    window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
  });
}

function renderDialog(currentBudget = 0) {
  const onOpenChange = vi.fn();
  render(
    <SetBudgetDialog
      open
      onOpenChange={onOpenChange}
      period={{ year: 2026, month: 12 }}
      currentBudget={currentBudget}
      totalSpent={150}
      currency="USD"
    />,
  );
  return { onOpenChange };
}

describe("SetBudgetDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("offline", () => {
    it("blocks saving while offline and keeps the typed amount", () => {
      setConnection(false);
      renderDialog();

      expect(screen.getByText("You're offline")).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Monthly budget"), {
        target: { value: "2500" },
      });
      const saveButton = screen.getByRole("button", { name: "Save budget" });
      expect(saveButton).toBeDisabled();

      fireEvent.submit(saveButton.closest("form") as HTMLFormElement);
      expect(setBudget).not.toHaveBeenCalled();

      setConnection(true);

      expect(screen.getByLabelText("Monthly budget")).toHaveValue("2500");
      fireEvent.click(screen.getByRole("button", { name: "Save budget" }));
      expect(setBudget).toHaveBeenCalledWith(
        { amount: 2500, year: 2026, month: 12 },
        expect.any(Object),
      );
    });

    it("says it's waiting when a save is paused by a dropped connection", () => {
      isSettingBudget = true;
      setConnection(false);
      renderDialog();

      expect(
        screen.getByRole("button", { name: "Waiting for connection…" }),
      ).toBeDisabled();
    });
  });

  beforeEach(() => {
    isSettingBudget = false;
    setBudget.mockReset();
    toastSuccess.mockReset();
  });

  it("saves the budget for the viewed month (happy path)", () => {
    const { onOpenChange } = renderDialog();

    expect(
      screen.getByRole("heading", { name: "Set budget" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/December 2026/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Monthly budget"), {
      target: { value: "2500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save budget" }));

    expect(setBudget).toHaveBeenCalledWith(
      { amount: 2500, year: 2026, month: 12 },
      expect.any(Object),
    );
    act(() => setBudget.mock.calls[0][1].onSuccess?.());
    expect(toastSuccess).toHaveBeenCalledWith(
      "Budget for December 2026 saved",
      { description: "$2,500.00" },
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("pre-fills the existing budget when editing", () => {
    renderDialog(1800);
    expect(
      screen.getByRole("heading", { name: "Edit budget" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly budget")).toHaveValue("1800");
  });

  it.each([
    ["", "Enter an amount."],
    ["0", "Amount must be greater than zero."],
    ["ten", "Enter a valid number, like 12.50."],
  ])("rejects %j without calling the API", (input, message) => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Monthly budget"), {
      target: { value: input },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save budget" }));

    expect(setBudget).not.toHaveBeenCalled();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("keeps the dialog open and explains a failed save", () => {
    const { onOpenChange } = renderDialog();

    fireEvent.change(screen.getByLabelText("Monthly budget"), {
      target: { value: "2500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save budget" }));
    act(() =>
      setBudget.mock.calls[0][1].onError?.(
        new ApiError(503, "Service Unavailable"),
      ),
    );

    expect(screen.getByText(/Couldn't save the budget/)).toHaveTextContent(
      "The server had a problem. Please try again in a moment.",
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
