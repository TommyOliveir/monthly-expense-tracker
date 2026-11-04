import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstallHint } from "@/features/pwa/components/InstallHint";

describe("InstallHint", () => {
  it("offers a one-tap Install button when the browser supports it", () => {
    const onInstall = vi.fn();
    render(
      <InstallHint
        installMethod="native-prompt"
        onInstall={onInstall}
        onDismiss={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Install" }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it("offers a guide on iPhone, where sites can't install themselves", () => {
    const onInstall = vi.fn();
    render(
      <InstallHint
        installMethod="ios-manual"
        onInstall={onInstall}
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Install IPON Ledger" }),
    ).toHaveTextContent("Install IPON Ledger on your iPhone");
    fireEvent.click(screen.getByRole("button", { name: "Show me how" }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it("disables the action while the prompt is open", () => {
    render(
      <InstallHint
        installMethod="native-prompt"
        isInstalling
        onInstall={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Install" })).toBeDisabled();
  });

  it("calls onDismiss when closed", () => {
    const onDismiss = vi.fn();
    render(
      <InstallHint
        installMethod="ios-manual"
        onInstall={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss install hint" }),
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
