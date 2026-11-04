/** Chromium-only event (Android Chrome, desktop Chrome/Edge); not in lib.dom yet. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * - `native-prompt`: the browser can show its own install dialog.
 * - `ios-manual`: iOS has no install API, so we guide the user through Share → Add to Home Screen.
 */
export type InstallMethod = "native-prompt" | "ios-manual";

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";
