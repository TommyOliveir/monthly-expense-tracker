import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";
import { resetInstallHintForTests } from "@/features/pwa/utils/installHintStorage";

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
    localStorage.clear();
    resetInstallHintForTests();
  });

  it("shows the hint in iPhone Safari", () => {
    mockIphone();

    const { result } = renderHook(() => useInstallHint());

    expect(result.current.isInstallHintVisible).toBe(true);
  });

  it("hides the hint once the app runs from the home screen", () => {
    mockIphone({ standalone: true });

    const { result } = renderHook(() => useInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
  });

  it("hides the hint on desktop browsers", () => {
    const { result } = renderHook(() => useInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
  });

  it("remembers a dismissal", () => {
    mockIphone();
    const { result } = renderHook(() => useInstallHint());

    act(() => result.current.dismissInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
    expect(localStorage.getItem("pwa-install-hint-dismissed")).toBe("true");
    expect(renderHook(() => useInstallHint()).result.current).toMatchObject({
      isInstallHintVisible: false,
    });
  });

  it("still dismisses for the session when storage is blocked", () => {
    mockIphone();
    let isBlocked = false;
    const originalGetItem = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      isBlocked = true;
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage,
      key: string,
    ) {
      if (isBlocked) throw new DOMException("Blocked", "SecurityError");
      return originalGetItem.call(this, key);
    });
    const { result } = renderHook(() => useInstallHint());
    expect(result.current.isInstallHintVisible).toBe(true);

    act(() => result.current.dismissInstallHint());

    expect(result.current.isInstallHintVisible).toBe(false);
  });
});
