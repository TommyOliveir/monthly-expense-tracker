import { afterEach, describe, expect, it, vi } from "vitest";
import { createInstallPromptEvent } from "@/features/pwa/test/createInstallPromptEvent";
import {
  dismissInstallHint,
  getCanPromptInstall,
  getIsInstallHintDismissed,
  promptInstall,
  resetInstallPromptForTests,
  subscribeToInstallPrompt,
} from "@/features/pwa/utils/installPromptStore";

describe("installPromptStore", () => {
  afterEach(() => {
    resetInstallPromptForTests();
  });

  it("captures the browser's install prompt and suppresses its infobar", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToInstallPrompt(listener);
    const { event } = createInstallPromptEvent();

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(getCanPromptInstall()).toBe(true);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it.each(["accepted", "dismissed"] as const)(
    "shows the native prompt once and reports %s",
    async (outcome) => {
      const { event, prompt } = createInstallPromptEvent(outcome);
      window.dispatchEvent(event);

      await expect(promptInstall()).resolves.toBe(outcome);

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(getCanPromptInstall()).toBe(false);
    },
  );

  it("reports unavailable when the browser offered no prompt (iOS)", async () => {
    await expect(promptInstall()).resolves.toBe("unavailable");
  });

  it("forgets the prompt once the app is installed", () => {
    window.dispatchEvent(createInstallPromptEvent().event);

    window.dispatchEvent(new Event("appinstalled"));

    expect(getCanPromptInstall()).toBe(false);
  });

  it("keeps a dismissal in memory only, so a reload shows the hint again", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    dismissInstallHint();

    expect(getIsInstallHintDismissed()).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
