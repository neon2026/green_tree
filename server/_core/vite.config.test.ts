import { describe, expect, it } from "vitest";
import viteConfig from "../../vite.config";

describe("Vite HMR config", () => {
  it("keeps strictPort enabled and does not force legacy remote HMR overrides", () => {
    expect(viteConfig.server?.strictPort).toBe(true);
    expect(viteConfig.server?.hmr).toBeUndefined();
  });

  it("keeps Manus preview hosts allowlisted", () => {
    const allowedHosts = viteConfig.server?.allowedHosts;
    expect(Array.isArray(allowedHosts)).toBe(true);
    expect(allowedHosts).toContain(".manus.computer");
    expect(allowedHosts).toContain("localhost");
  });
});
