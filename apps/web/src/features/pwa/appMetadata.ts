/** Shared by the web manifest, the root layout metadata and the generated icons. */
export const APP_NAME = "IPON Ledger";
export const APP_SHORT_NAME = "IPON";
export const APP_DESCRIPTION = "A simple monthly budget and expense tracker.";
export const APP_START_URL = "/tracker";

// Mirrors --background / --brand / --brand-foreground / --primary in globals.css.
export const APP_COLORS = {
  background: "#faf5ec",
  brand: "#c96f4a",
  brandDeep: "#a4522f",
  ink: "#2c2115",
} as const;

export const MANIFEST_ICON_SIZES = [192, 512] as const;
export type ManifestIconSize = (typeof MANIFEST_ICON_SIZES)[number];
