import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";
import { createInstallPromptEvent } from "@/features/pwa/test/createInstallPromptEvent";
import { resetInstallPromptForTests } from "@/features/pwa/utils/installPromptStore";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function mockIphone({ standalone = false } = {}) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE_UA);
  Object.defineProperty(navigator, "standalone", {
    configurable: true,
    value: standalone,
  });
}

describe("useInstallHint", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as NavigatorWithStandalone).standalone;
    resetInstallPromptForTests();
  });

  it("offers the manual guide in iPhone Safari", () => {
    mockIphone();

    const { result } = renderHook(() => useInstallHint());

    expect(result.current).toMatchObject({
      installMethod: "ios-manual",
      isInstallHintVisible: true,
    });
  });

  it("offers the native prompt once the browser makes one available", () => {
    const { result } = renderHook(() => useInstallHint());
    expect(result.current.isInstallHintVisible).toBe(false);

    act(() => {
      window.dispatchEvent(createInstallPromptEvent().event);
    });

    expect(result.current).toMatchObject({
      installMethod: "native-prompt",
      isInstallHintVisible: true,
    });
  });

  it("hides the hint once the app runs from the home screen", () => {
    mockIphone({ standalone: true });

    const { result } = renderHook(() => useInstallHint());

    expect(result.current.installMethod).toBeNull();
    expect(result.current.isInstallHintVisible).toBe(false);
  });

  it("hides the hint on browsers that can't install", () => {
    const { result } = renderHook(() => useInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
  });

  it("hides the hint after closing it", () => {
    mockIphone();
    const { result } = renderHook(() => useInstallHint());

    act(() => result.current.dismissInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
  });

  it("shows the hint again on the next page load", () => {
    mockIphone();
    const { result } = renderHook(() => useInstallHint());
    act(() => result.current.dismissInstallHint());

    resetInstallPromptForTests(); // what a reload does to module state
    const { result: afterReload } = renderHook(() => useInstallHint());

    expect(afterReload.current.isInstallHintVisible).toBe(true);
  });
});
