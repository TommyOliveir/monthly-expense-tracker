import type { MetadataRoute } from "next";
import {
  APP_COLORS,
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_START_URL,
  MANIFEST_ICON_SIZES,
} from "@/features/pwa/appMetadata";

export default function manifest(): MetadataRoute.Manifest {
  const icons: MetadataRoute.Manifest["icons"] = MANIFEST_ICON_SIZES.map(
    (size) => ({
      src: `/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    }),
  );

  return {
    id: APP_START_URL,
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: APP_START_URL,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: APP_COLORS.background,
    theme_color: APP_COLORS.background,
    icons: [
      ...icons,
      // The artwork sits inside the maskable safe zone, so the 512 doubles as maskable.
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
