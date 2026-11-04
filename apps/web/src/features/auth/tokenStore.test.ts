import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getTokens,
  setTokens,
  subscribeToTokens,
} from "@/features/auth/tokenStore";

describe("tokenStore", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearTokens();
    localStorage.clear();
  });

  it("persists tokens and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToTokens(listener);

    setTokens({ accessToken: "access", refreshToken: "refresh" });

    expect(getTokens()).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });
    expect(JSON.parse(localStorage.getItem("session") ?? "null")).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("keeps the session in memory when storage is blocked (Safari)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      setTokens({ accessToken: "access", refreshToken: "refresh" }),
    ).not.toThrow();
    expect(getTokens()?.accessToken).toBe("access");

    expect(() => clearTokens()).not.toThrow();
    expect(getTokens()).toBeNull();
  });
});
