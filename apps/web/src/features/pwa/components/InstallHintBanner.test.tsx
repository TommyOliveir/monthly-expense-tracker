import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { InstallHintBanner } from "@/features/pwa/components/InstallHintBanner";
import type {
  InstallMethod,
  InstallOutcome,
} from "@/features/pwa/types/installPrompt";

const dismissInstallHint = vi.fn();
const promptInstall = vi.fn<() => Promise<InstallOutcome>>();
let installMethod: InstallMethod | null = "ios-manual";
let isInstallHintVisible = true;

vi.mock("@/features/pwa/hooks/useInstallHint", () => ({
  useInstallHint: () => ({
    installMethod,
    isInstallHintVisible,
    dismissInstallHint,
    promptInstall,
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("InstallHintBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installMethod = "ios-manual";
    isInstallHintVisible = true;
  });

  it("opens the step-by-step guide on iPhone", async () => {
    render(<InstallHintBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Show me how" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Add to Home Screen");
    expect(promptInstall).not.toHaveBeenCalled();
  });

  it("opens the browser's install prompt where supported", async () => {
    installMethod = "native-prompt";
    promptInstall.mockResolvedValue("accepted");
    render(<InstallHintBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Install" }));

    await waitFor(() => expect(promptInstall).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Installing IPON Ledger…"),
    );
  });

  it("stays quiet when the user cancels the browser prompt", async () => {
    installMethod = "native-prompt";
    promptInstall.mockResolvedValue("dismissed");
    render(<InstallHintBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Install" }));

    await waitFor(() => expect(promptInstall).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Install" })).toBeEnabled(),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows an error if the prompt fails", async () => {
    installMethod = "native-prompt";
    promptInstall.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<InstallHintBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Install" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("closes via the dismiss button", () => {
    render(<InstallHintBanner />);

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss install hint" }),
    );

    expect(dismissInstallHint).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when the hint is hidden", () => {
    isInstallHintVisible = false;
    render(<InstallHintBanner />);

    expect(
      screen.queryByRole("region", { name: "Install IPON Ledger" }),
    ).not.toBeInTheDocument();
  });
});
