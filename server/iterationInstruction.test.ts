import { describe, expect, it } from "vitest";
import { parseIterationInstruction } from "./services/iterationInstruction";

describe("parseIterationInstruction", () => {
  it("extracts targeted areas and rgb intent from a freeform instruction", () => {
    const result = parseIterationInstruction("把吧台和包间的灯光调得更亮一点");

    expect(result.affectedAreas).toEqual(["bar", "private_room"]);
    expect(result.extractedChanges.rgbDensity).toBe("high");
    expect(result.summary).toContain("局部重绘");
  });

  it("treats global instructions as all-area rerender requests", () => {
    const result = parseIterationInstruction("整体改成更高端的紫色氛围");

    expect(result.affectedAreas).toEqual(["entrance", "corridor", "bar", "stage", "seating", "private_room", "restroom"]);
    expect(result.extractedChanges.colorScheme).toBe("neon purple");
    expect(result.extractedChanges.budgetRange).toBe("premium");
  });

  it("returns a safe warning when no area can be identified", () => {
    const result = parseIterationInstruction("把氛围改得更有未来感");

    expect(result.affectedAreas).toEqual([]);
    expect(result.summary).toContain("未识别出明确的重绘区域");
  });
});
