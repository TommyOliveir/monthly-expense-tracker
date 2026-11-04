export type DeviceInfo = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
};

export function isIosDevice({
  userAgent,
  platform,
  maxTouchPoints,
}: DeviceInfo): boolean {
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;

  // iPadOS 13+ reports itself as a Mac; touch support gives it away.
  return platform === "MacIntel" && maxTouchPoints > 1;
}
