import { describe, expect, it } from "vitest";
import { buildDeliveryPackageFileName, buildDeliveryPackageMetadata, buildDeliveryPackageZip, buildRenderingExportFileName } from "../client/src/lib/deliveryPackage";

describe("deliveryPackage", () => {
  it("builds stable delivery and rendering export file names", () => {
    expect(buildDeliveryPackageFileName("Party K", 390049)).toBe("design-390049-Party-K");
    expect(buildDeliveryPackageFileName(undefined, 12)).toBe("design-12-设计方案");
    expect(buildRenderingExportFileName("entrance", 3, "png")).toBe("entrance-v3.png");
    expect(buildRenderingExportFileName("bar", undefined, "jpg")).toBe("bar-v1.jpg");
  });

  it("marks fallback renderings in metadata", () => {
    const metadata = buildDeliveryPackageMetadata({
      designId: 1,
      projectId: 2,
      styleTheme: "Party K",
      budgetRange: "standard",
      exportedAt: new Date("2026-05-07T02:00:00.000Z"),
      budgetReport: "report",
      renderings: [
        {
          area: "entrance",
          label: "门头",
          version: 1,
          isFallback: true,
          url: "data:image/svg+xml;base64,abc",
        },
      ],
    });

    expect(metadata.exportedAt).toBe("2026-05-07T02:00:00.000Z");
    expect(metadata.renderings).toEqual([
      {
        area: "entrance",
        label: "门头",
        version: 1,
        isFallback: true,
        url: "data:image/svg+xml;base64,abc",
      },
    ]);
  });

  it("packages renderings, budget report, and metadata into a zip", async () => {
    const zip = await buildDeliveryPackageZip(
      {
        designId: 390049,
        projectId: 90001,
        styleTheme: "Party K",
        budgetRange: "standard",
        exportedAt: new Date("2026-05-07T02:00:00.000Z"),
        budgetReport: "预算总计：123456",
        renderings: [
          {
            area: "entrance",
            label: "门头",
            version: 3,
            url: "https://example.com/rendering-1.png",
          },
          {
            area: "bar",
            label: "吧台",
            version: 1,
            isFallback: true,
            url: "data:image/svg+xml;base64,ZmFrZQ==",
          },
        ],
      },
      async (url) => new TextEncoder().encode(`bytes:${url}`)
    );

    const files = Object.keys(zip.files).sort();
    expect(files).toEqual([
      "README.txt",
      "metadata.json",
      "renderings/",
      "renderings/bar-吧台-v1.png",
      "renderings/entrance-门头-v3.png",
      "reports/",
      "reports/budget-report.md",
    ]);

    const readme = await zip.file("README.txt")?.async("string");
    const report = await zip.file("reports/budget-report.md")?.async("string");
    const metadata = JSON.parse((await zip.file("metadata.json")?.async("string")) || "{}");
    const entranceBytes = await zip.file("renderings/entrance-门头-v3.png")?.async("string");

    expect(readme).toContain("交付包：Party K");
    expect(report).toBe("预算总计：123456");
    expect(metadata.renderings).toHaveLength(2);
    expect(metadata.renderings[1].isFallback).toBe(true);
    expect(entranceBytes).toContain("bytes:https://example.com/rendering-1.png");
  });
});
