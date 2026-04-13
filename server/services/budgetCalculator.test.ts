import { describe, it, expect } from "vitest";
import { generateMaterialsList, generateBudgetReport } from "./budgetCalculator";

describe("Budget Calculator", () => {
  const testParams = {
    totalArea: 2500,
    machineCount: 48,
    privateRoomCount: 8,
  };

  it("should generate materials list for economy budget", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "economy"
    );

    expect(estimate).toHaveProperty("totalMaterials");
    expect(estimate).toHaveProperty("laborCost");
    expect(estimate).toHaveProperty("contingency");
    expect(estimate).toHaveProperty("totalCost");
    expect(estimate).toHaveProperty("costPerSqm");
    expect(estimate).toHaveProperty("materials");

    expect(estimate.materials.length).toBeGreaterThan(0);
    expect(estimate.totalCost).toBeGreaterThan(0);
  });

  it("should generate different budgets for different levels", () => {
    const economy = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "economy"
    );

    const standard = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const premium = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "premium"
    );

    expect(economy.totalCost).toBeLessThan(standard.totalCost);
    expect(standard.totalCost).toBeLessThan(premium.totalCost);
  });

  it("should include all required material categories", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const categories = new Set(estimate.materials.map((m) => m.category));

    expect(categories.has("地面")).toBe(true);
    expect(categories.has("墙面")).toBe(true);
    expect(categories.has("灯光")).toBe(true);
    expect(categories.has("家具")).toBe(true);
    expect(categories.has("设备")).toBe(true);
  });

  it("should calculate labor cost as 30% of materials", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const expectedLaborCost = estimate.totalMaterials * 0.3;
    expect(estimate.laborCost).toBeCloseTo(expectedLaborCost, 1);
  });

  it("should calculate contingency as 10% of materials", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const expectedContingency = estimate.totalMaterials * 0.1;
    expect(estimate.contingency).toBeCloseTo(expectedContingency, 1);
  });

  it("should scale materials based on area", () => {
    const small = generateMaterialsList(1000, 20, 4, "standard");
    const large = generateMaterialsList(5000, 100, 20, "standard");

    expect(large.totalCost).toBeGreaterThan(small.totalCost);
  });

  it("should scale materials based on machine count", () => {
    const fewMachines = generateMaterialsList(2500, 20, 8, "standard");
    const manyMachines = generateMaterialsList(2500, 100, 8, "standard");

    expect(manyMachines.totalCost).toBeGreaterThan(fewMachines.totalCost);
  });

  it("should generate valid budget report", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const report = generateBudgetReport(estimate);

    expect(report).toContain("电竞馆装修设计");
    expect(report).toContain("造价估算报表");
    expect(report).toContain("材料清单");
    expect(report).toContain("总造价");
    expect(report).toContain("单位面积造价");
  });

  it("should include material details in report", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const report = generateBudgetReport(estimate);

    estimate.materials.forEach((material) => {
      expect(report).toContain(material.name);
    });
  });

  it("should calculate cost per square meter correctly", () => {
    const estimate = generateMaterialsList(
      testParams.totalArea,
      testParams.machineCount,
      testParams.privateRoomCount,
      "standard"
    );

    const expectedCostPerSqm = estimate.totalCost / testParams.totalArea;
    expect(estimate.costPerSqm).toBeCloseTo(expectedCostPerSqm, 1);
  });
});
