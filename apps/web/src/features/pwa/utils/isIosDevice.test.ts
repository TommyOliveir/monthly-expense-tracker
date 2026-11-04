import { describe, expect, it } from "vitest";
import { isIosDevice } from "@/features/pwa/utils/isIosDevice";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";

describe("isIosDevice", () => {
  it.each([
    ["iPhone", IPHONE_UA, "iPhone", 5, true],
    ["iPadOS posing as a Mac", MAC_UA, "MacIntel", 5, true],
    ["a real Mac", MAC_UA, "MacIntel", 0, false],
    ["Android", ANDROID_UA, "Linux armv8l", 5, false],
  ])("detects %s", (_label, userAgent, platform, maxTouchPoints, expected) => {
    expect(isIosDevice({ userAgent, platform, maxTouchPoints })).toBe(expected);
  });
});
