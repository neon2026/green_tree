import { describe, expect, it } from "vitest";
import {
  generateDesigns,
  getAvailableStyles,
  getRenderingThemeForStyle,
  getSupportedGenerationStyleIds,
} from "./designGenerator";
import type { CADParameters } from "./cadParser";

describe("Design Generator", () => {
  const mockCADParams: CADParameters = {
    totalArea: 2500,
    machineCount: 48,
    privateRoomCount: 8,
    barArea: 120,
    hallArea: 1800,
    vipArea: 400,
    coreAreas: ["bar", "hall", "vip_lounge", "gaming_stations"],
  };

  it("should generate 5-10 designs", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    expect(designs.length).toBeGreaterThanOrEqual(5);
    expect(designs.length).toBeLessThanOrEqual(10);
  });

  it("should generate the 7 supported styles including Party K", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    expect(designs.map((design) => design.styleId)).toEqual([
      "cyberpunk",
      "future_tech",
      "dark_gaming",
      "minimalist",
      "retro_gaming",
      "trendy_bar",
      "party_k",
    ]);
  });

  it("should generate designs with correct structure", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    designs.forEach((design) => {
      expect(design).toHaveProperty("id");
      expect(design).toHaveProperty("styleId");
      expect(design).toHaveProperty("styleName");
      expect(design).toHaveProperty("parameters");
      expect(design).toHaveProperty("estimatedBudget");
      expect(design).toHaveProperty("promptForImageGeneration");
    });
  });

  it("should include CAD parameters in each design", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "standard",
      rgbDensity: "high",
    });

    designs.forEach((design) => {
      expect(design.parameters.totalArea).toBe(mockCADParams.totalArea);
      expect(design.parameters.machineCount).toBe(mockCADParams.machineCount);
      expect(design.parameters.privateRoomCount).toBe(mockCADParams.privateRoomCount);
    });
  });

  it("should adjust budget by budget range", () => {
    const economyDesigns = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "economy",
      rgbDensity: "medium",
    });

    const premiumDesigns = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "premium",
      rgbDensity: "medium",
    });

    expect(premiumDesigns[0].estimatedBudget).toBeGreaterThan(economyDesigns[0].estimatedBudget);
  });

  it("should include rendering prompt details", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      budgetRange: "standard",
      rgbDensity: "high",
    });

    designs.forEach((design) => {
      expect(design.promptForImageGeneration).toContain("esports lounge");
      expect(design.promptForImageGeneration).toContain(mockCADParams.totalArea.toString());
      expect(design.promptForImageGeneration).toContain(mockCADParams.machineCount.toString());
      expect(design.promptForImageGeneration).toContain("RGB");
    });
  });

  it("should expose Party K as an available style", () => {
    const styles = getAvailableStyles();
    const partyK = styles.find((style) => style.id === "party_k");

    expect(partyK).toBeDefined();
    expect(partyK?.name).toBe("Party K");
    expect(partyK?.theme).toBe("Party K");
    expect(partyK?.features.join(" ")).toContain("Neon");
  });

  it("should provide stable supported style ids and rendering theme mapping", () => {
    expect(getSupportedGenerationStyleIds()).toEqual([
      "cyberpunk",
      "future_tech",
      "dark_gaming",
      "minimalist",
      "retro_gaming",
      "trendy_bar",
      "party_k",
    ]);
    expect(getRenderingThemeForStyle("future_tech")).toBe("futuristic");
    expect(getRenderingThemeForStyle("trendy_bar")).toBe("neon");
    expect(getRenderingThemeForStyle("unknown_style")).toBe("party_k");
  });
});
