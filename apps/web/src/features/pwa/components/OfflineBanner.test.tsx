import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfflineBanner } from "@/features/pwa/components/OfflineBanner";

function setConnection(isOnline: boolean) {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
  act(() => {
    window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
  });
}

describe("OfflineBanner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only while the device is offline", () => {
    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    setConnection(false);
    expect(screen.getByRole("status")).toHaveTextContent("You're offline");

    setConnection(true);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
