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
    expect(lines).toContain("- 平面布局示意：总面积 800 ㎡，覆盖门头、通道、吧台、舞台、散座、包间、卫生间。");
    expect(lines).toContain("- 机位与包间配置：机位 48 台，包间 6 间。");
    expect(lines).toContain("- 区域配置表：包含吧台 80 ㎡、大厅 420 ㎡、包间 160 ㎡。");
    expect(lines.some((line) => line.includes("constructions 表中已有 DWG / PDF 真正图纸文件"))).toBe(true);
  });
});
