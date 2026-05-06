import { describe, expect, it } from "vitest";
import viteConfig from "../../vite.config";

describe("Vite HMR config", () => {
  it("uses secure same-origin HMR settings for preview domains", () => {
    expect(viteConfig.server?.strictPort).toBe(true);
    expect(viteConfig.server?.hmr).toMatchObject({
      protocol: "wss",
      clientPort: 443,
    });
  });

  it("keeps Manus preview hosts allowlisted", () => {
    const allowedHosts = viteConfig.server?.allowedHosts;
    expect(Array.isArray(allowedHosts)).toBe(true);
    expect(allowedHosts).toContain(".manus.computer");
    expect(allowedHosts).toContain("localhost");
  });
});
