import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateImageMock } = vi.hoisted(() => ({
  generateImageMock: vi.fn(),
}));

vi.mock("../_core/imageGeneration", () => ({
  generateImage: generateImageMock,
}));

import {
  generateDesignRenderings,
  generatePlaceholderImage,
  generateRendering,
  generateRenderingPrompt,
} from "./renderingGenerator";

describe("Rendering Generator", () => {
  beforeEach(() => {
    generateImageMock.mockReset();
  });

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
    expect(prompt.toLowerCase()).toContain("party k nightlife entertainment venue");
    expect(prompt.toLowerCase()).toContain("rgb led");
    expect(prompt).toContain("800");
  });

  it("should generate svg placeholder images for failed areas", () => {
    const placeholder = generatePlaceholderImage("stage", "Party K");
    expect(placeholder.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });

  it("should fall back to a placeholder image when single-area generation fails", async () => {
    generateImageMock.mockRejectedValueOnce(new Error("usage exhausted"));

    const result = await generateRendering({
      styleTheme: "party_k",
      colorScheme: "neon purple and cyan",
      area: "restroom",
      machineCount: 30,
      roomCount: 6,
      totalArea: 800,
      rgbDensity: "high",
    });

    expect(result.area).toBe("restroom");
    expect(result.isFallback).toBe(true);
    expect(result.url.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });

  it("should export a multi-area generation helper", () => {
    expect(typeof generateDesignRenderings).toBe("function");
  });
});
