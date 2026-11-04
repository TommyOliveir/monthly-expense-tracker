import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstallHintBanner } from "@/features/pwa/components/InstallHintBanner";

const dismissInstallHint = vi.fn();
let isInstallHintVisible = true;

vi.mock("@/features/pwa/hooks/useInstallHint", () => ({
  useInstallHint: () => ({ isInstallHintVisible, dismissInstallHint }),
}));

describe("InstallHintBanner", () => {
  beforeEach(() => {
    dismissInstallHint.mockReset();
    isInstallHintVisible = true;
  });

  it("renders the hint when it should be visible", () => {
    render(<InstallHintBanner />);

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss install hint" }),
    );

    expect(dismissInstallHint).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when the hint is hidden", () => {
    isInstallHintVisible = false;

    const { container } = render(<InstallHintBanner />);

    expect(container).toBeEmptyDOMElement();
  });
});
