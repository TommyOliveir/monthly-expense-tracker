import {
  MANIFEST_ICON_SIZES,
  type ManifestIconSize,
} from "@/features/pwa/appMetadata";
import { renderAppIcon } from "@/features/pwa/utils/renderAppIcon";

type IconProps = {
  id: Promise<string | number>;
};

export function generateImageMetadata() {
  return MANIFEST_ICON_SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

function toIconSize(id: string | number): ManifestIconSize {
  const size = Number(id);
  return MANIFEST_ICON_SIZES.find((iconSize) => iconSize === size) ?? 512;
}

export default async function Icon({ id }: IconProps) {
  return renderAppIcon(toIconSize(await id));
}
