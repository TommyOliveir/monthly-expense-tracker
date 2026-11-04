import { describe, expect, it } from "vitest";
import { getLikelySafariShareLayout } from "@/features/pwa/utils/getLikelySafariShareLayout";

const safariUserAgent = (version: string) =>
  `Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Mobile/15E148 Safari/604.1`;

describe("getLikelySafariShareLayout", () => {
  it.each([
    ["Safari 26 (compact bar)", safariUserAgent("26.0"), "address-bar-menu"],
    ["Safari 27", safariUserAgent("27.1"), "address-bar-menu"],
    ["Safari 18", safariUserAgent("18.6"), "bottom-toolbar"],
    ["Safari 15", safariUserAgent("15.4"), "bottom-toolbar"],
    [
      "a browser without a Safari version",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) CriOS/130.0",
      "bottom-toolbar",
    ],
  ])("guesses %s", (_label, userAgent, expected) => {
    expect(getLikelySafariShareLayout(userAgent)).toBe(expected);
  });
});
