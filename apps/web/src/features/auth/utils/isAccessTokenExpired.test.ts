import { describe, expect, it } from "vitest";
import { isAccessTokenExpired } from "@/features/auth/utils/isAccessTokenExpired";

const NOW_MS = Date.UTC(2026, 10, 18, 12, 0, 0);
const NOW_SECONDS = NOW_MS / 1000;

function buildToken(payload: Record<string, unknown>): string {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

describe("isAccessTokenExpired", () => {
  it("is false for a token that is valid for several more minutes", () => {
    const token = buildToken({ sub: "user-1", exp: NOW_SECONDS + 600 });

    expect(isAccessTokenExpired(token, NOW_MS)).toBe(false);
  });

  it("is true for a token that has expired", () => {
    const token = buildToken({ sub: "user-1", exp: NOW_SECONDS - 1 });

    expect(isAccessTokenExpired(token, NOW_MS)).toBe(true);
  });

  it("is true for a token that expires within the safety margin", () => {
    const token = buildToken({ sub: "user-1", exp: NOW_SECONDS + 10 });

    expect(isAccessTokenExpired(token, NOW_MS)).toBe(true);
  });

  it("reads payloads that use base64url characters", () => {
    // "~~~" encodes to "fn5-" in base64url, which plain atob rejects.
    const token = buildToken({ name: "~~~", exp: NOW_SECONDS + 600 });

    expect(token).toMatch(/[-_]/);
    expect(isAccessTokenExpired(token, NOW_MS)).toBe(false);
  });

  it("treats unreadable tokens as expired", () => {
    expect(isAccessTokenExpired("not-a-jwt", NOW_MS)).toBe(true);
    expect(isAccessTokenExpired("a.%%%.c", NOW_MS)).toBe(true);
    expect(isAccessTokenExpired(buildToken({ sub: "user-1" }), NOW_MS)).toBe(
      true,
    );
  });
});
