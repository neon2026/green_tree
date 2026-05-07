import { describe, expect, it } from "vitest";
import { buildConstructionPdfFileName, buildConstructionPdfLines } from "../client/src/lib/constructionPdf";

describe("constructionPdf", () => {
  it("builds stable pdf file names", () => {
    expect(buildConstructionPdfFileName(90001, 390049)).toBe("construction-90001-390049.pdf");
  });

  it("builds readable construction lines with CAD summary", () => {
    const lines = buildConstructionPdfLines({
      projectId: 90001,
      designId: 390049,
      projectName: "绿树电竞测试项目",
      styleTheme: "Party K",
      colorScheme: "霓虹紫蓝",
      budgetRange: "中高档",
      cadParameters: {
        totalArea: 800,
        machineCount: 48,
        roomCount: 6,
        barArea: 80,
        hallArea: 420,
        vipArea: 160,
      },
    });

    expect(lines).toContain("项目名称：绿树电竞测试项目");
    expect(lines).toContain("风格主题：Party K");
    expect(lines).toContain("- 总面积：800 ㎡");
    expect(lines).toContain("- 机位数量：48");
    expect(lines).toContain("- 包间数量：6");
    expect(lines.some((line) => line.includes("DWG 结构化施工图仍保留为后续扩展入口"))).toBe(true);
  });
});
