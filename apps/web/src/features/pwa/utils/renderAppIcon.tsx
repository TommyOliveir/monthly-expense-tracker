import { ImageResponse } from "next/og";
import { APP_COLORS } from "@/features/pwa/appMetadata";

/**
 * Brand mark: a terracotta "ipon" (savings) coin on the cream background.
 * The background is full-bleed and the coin stays inside the central 60%, so
 * the same image works as a regular icon, an Apple touch icon and a maskable icon.
 */
export function renderAppIcon(size: number): ImageResponse {
  const coinSize = Math.round(size * 0.58);
  const ringWidth = Math.max(2, Math.round(size * 0.03));
  const innerRingSize = Math.round(coinSize * 0.76);
  const innerRingWidth = Math.max(1, Math.round(size * 0.012));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: APP_COLORS.background,
      }}
    >
      <div
        style={{
          width: coinSize,
          height: coinSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: APP_COLORS.brand,
          border: `${ringWidth}px solid ${APP_COLORS.brandDeep}`,
        }}
      >
        <div
          style={{
            width: innerRingSize,
            height: innerRingSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: `${innerRingWidth}px solid rgba(250, 245, 236, 0.45)`,
          }}
        >
          {/* Drawn instead of typed: the bundled OG font has no bold weight. */}
          <div
            style={{
              width: Math.round(coinSize * 0.13),
              height: Math.round(coinSize * 0.44),
              borderRadius: Math.round(coinSize * 0.04),
              background: APP_COLORS.background,
            }}
          />
        </div>
      </div>
    </div>,
    { width: size, height: size },
  );
}
