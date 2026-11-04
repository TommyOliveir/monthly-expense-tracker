import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstallHint } from "@/features/pwa/components/InstallHint";

describe("InstallHint", () => {
  it("explains how to add the app to the home screen", () => {
    render(<InstallHint onDismiss={vi.fn()} />);

    expect(
      screen.getByRole("region", { name: "Install IPON Ledger" }),
    ).toHaveTextContent("Add to Home Screen");
  });

  it("calls onDismiss when closed", () => {
    const onDismiss = vi.fn();
    render(<InstallHint onDismiss={onDismiss} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss install hint" }),
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
