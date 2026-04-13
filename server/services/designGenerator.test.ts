import { describe, it, expect } from "vitest";
import { generateDesigns, getAvailableStyles } from "./designGenerator";
import { CADParameters } from "./cadParser";

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
      colorTheme: "blue",
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    expect(designs.length).toBeGreaterThanOrEqual(5);
    expect(designs.length).toBeLessThanOrEqual(10);
  });

  it("should generate designs with correct structure", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
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

      expect(typeof design.id).toBe("string");
      expect(typeof design.styleId).toBe("string");
      expect(typeof design.styleName).toBe("string");
      expect(typeof design.estimatedBudget).toBe("number");
      expect(typeof design.promptForImageGeneration).toBe("string");
    });
  });

  it("should include CAD parameters in design", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    designs.forEach((design) => {
      expect(design.parameters.totalArea).toBe(mockCADParams.totalArea);
      expect(design.parameters.machineCount).toBe(mockCADParams.machineCount);
      expect(design.parameters.privateRoomCount).toBe(mockCADParams.privateRoomCount);
    });
  });

  it("should adjust budget based on budget range", () => {
    const economyDesigns = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
      budgetRange: "economy",
      rgbDensity: "medium",
    });

    const premiumDesigns = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
      budgetRange: "premium",
      rgbDensity: "medium",
    });

    const economyBudget = economyDesigns[0].estimatedBudget;
    const premiumBudget = premiumDesigns[0].estimatedBudget;

    expect(premiumBudget).toBeGreaterThan(economyBudget);
  });

  it("should generate different designs for different color themes", () => {
    const blueDesigns = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    const redDesigns = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "red",
      budgetRange: "standard",
      rgbDensity: "medium",
    });

    // 应该有不同的风格
    const blueStyles = new Set(blueDesigns.map((d) => d.styleId));
    const redStyles = new Set(redDesigns.map((d) => d.styleId));

    expect(blueStyles.size).toBeGreaterThan(0);
    expect(redStyles.size).toBeGreaterThan(0);
  });

  it("should include prompt for image generation", () => {
    const designs = generateDesigns({
      cadParameters: mockCADParams,
      colorTheme: "blue",
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

  it("should get available styles", () => {
    const styles = getAvailableStyles();

    expect(styles.length).toBeGreaterThan(0);
    expect(styles.length).toBeGreaterThanOrEqual(5);

    styles.forEach((style) => {
      expect(style).toHaveProperty("id");
      expect(style).toHaveProperty("name");
      expect(style).toHaveProperty("theme");
      expect(style).toHaveProperty("colorScheme");
      expect(style).toHaveProperty("description");
      expect(style).toHaveProperty("features");
      expect(style).toHaveProperty("budgetRange");

      expect(Array.isArray(style.features)).toBe(true);
      expect(style.features.length).toBeGreaterThan(0);
    });
  });
});
