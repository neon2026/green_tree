import { describe, expect, it } from "vitest";
import { generateDesignRenderings, generatePlaceholderImage, generateRenderingPrompt } from "./renderingGenerator";

describe("Rendering Generator", () => {
  it("should build Party K prompt content for core areas", () => {
    const prompt = generateRenderingPrompt({
      styleTheme: "party_k",
      colorScheme: "neon purple and cyan",
      area: "bar",
      machineCount: 30,
      roomCount: 6,
      totalArea: 800,
      rgbDensity: "high",
    });

    expect(prompt.toLowerCase()).toContain("bar");
    expect(prompt.toLowerCase()).toContain("party_k");
    expect(prompt.toLowerCase()).toContain("rgb led");
    expect(prompt).toContain("800");
  });

  it("should generate svg placeholder images for failed areas", () => {
    const placeholder = generatePlaceholderImage("stage", "Party K");
    expect(placeholder.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });

  it("should export a multi-area generation helper", () => {
    expect(typeof generateDesignRenderings).toBe("function");
  });
});
