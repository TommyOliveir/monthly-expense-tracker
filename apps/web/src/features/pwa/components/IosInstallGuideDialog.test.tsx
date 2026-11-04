import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IosInstallGuideDialog } from "@/features/pwa/components/IosInstallGuideDialog";
import type { SafariShareLayout } from "@/features/pwa/types/installPrompt";

function renderGuide(primaryLayout: SafariShareLayout) {
  render(
    <IosInstallGuideDialog
      open
      onOpenChange={vi.fn()}
      primaryLayout={primaryLayout}
      siteHost="ipon.example.app"
    />,
  );
  return screen.getAllByRole("listitem");
}

describe("IosInstallGuideDialog", () => {
  it("leads with the ⋯ button next to the address bar on the compact layout", () => {
    const [shareStep] = renderGuide("address-bar-menu");

    expect(shareStep).toHaveTextContent(
      "Step 1: Tap the ⋯ button on the right of the address bar, then tap Share.",
    );
    expect(shareStep).toHaveTextContent(
      "No button there? Tap Share in the toolbar at the bottom.",
    );
    expect(within(shareStep).getAllByText("ipon.example.app")).toHaveLength(1);
  });

  it("leads with the bottom toolbar on the classic layout, with the ⋯ fallback", () => {
    const [shareStep] = renderGuide("bottom-toolbar");

    expect(shareStep).toHaveTextContent(
      "Step 1: Tap Share in the toolbar at the bottom of Safari.",
    );
    expect(shareStep).toHaveTextContent(
      "Only see the address bar? Tap the ⋯ button on its right, then Share.",
    );
  });

  it("finishes with Add to Home Screen and Add", () => {
    const steps = renderGuide("address-bar-menu");

    expect(steps).toHaveLength(3);
    expect(steps[1]).toHaveTextContent("Add to Home Screen");
    expect(steps[2]).toHaveTextContent("Tap Add.");
  });
});
