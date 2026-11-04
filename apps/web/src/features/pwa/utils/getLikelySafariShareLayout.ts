import type { SafariShareLayout } from "@/features/pwa/types/installPrompt";

const COMPACT_LAYOUT_SAFARI_VERSION = 26;

/**
 * Best guess only: the layout is a user setting a website can't read. Safari 26
 * defaults to the compact bar, older versions to the bottom toolbar.
 */
export function getLikelySafariShareLayout(
  userAgent: string,
): SafariShareLayout {
  const match = /Version\/(\d+)/.exec(userAgent);
  const safariVersion = match ? Number(match[1]) : 0;

  return safariVersion >= COMPACT_LAYOUT_SAFARI_VERSION
    ? "address-bar-menu"
    : "bottom-toolbar";
}
