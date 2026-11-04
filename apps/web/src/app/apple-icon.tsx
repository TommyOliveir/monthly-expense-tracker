import { renderAppIcon } from "@/features/pwa/utils/renderAppIcon";

// iOS home-screen icon. iOS rounds the corners itself and fills transparency with black.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon(size.width);
}
