import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("web app manifest", () => {
  it("is installable as a standalone app that opens the tracker", () => {
    const appManifest = manifest();

    expect(appManifest).toMatchObject({
      name: "IPON Ledger",
      short_name: "IPON",
      start_url: "/tracker",
      scope: "/",
      display: "standalone",
      background_color: "#faf5ec",
      theme_color: "#faf5ec",
    });
  });

  it("lists 192px and 512px icons, including a maskable one", () => {
    const icons = manifest().icons ?? [];

    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icon/192",
          sizes: "192x192",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icon/512",
          sizes: "512x512",
          purpose: "any",
        }),
        expect.objectContaining({ src: "/icon/512", purpose: "maskable" }),
      ]),
    );
  });
});
