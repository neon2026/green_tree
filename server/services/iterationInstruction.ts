import type { RenderingAreaType } from "./renderingGenerator";

export interface ParsedIterationInstruction {
  rawInstruction: string;
  normalizedInstruction: string;
  affectedAreas: RenderingAreaType[];
  extractedChanges: {
    rgbDensity?: "low" | "medium" | "high";
    colorScheme?: string;
    budgetRange?: string;
  };
  summary: string;
}

const areaKeywordMap: Array<{ area: RenderingAreaType; keywords: string[] }> = [
  { area: "entrance", keywords: ["门头", "入口", "大门"] },
  { area: "corridor", keywords: ["通道", "走廊"] },
  { area: "bar", keywords: ["吧台", "前台", "收银"] },
  { area: "stage", keywords: ["舞台", "主舞台", "dj"] },
  { area: "seating", keywords: ["散座", "大厅", "卡座", "座位区"] },
  { area: "private_room", keywords: ["包间", "vip", "贵宾"] },
  { area: "restroom", keywords: ["卫生间", "洗手间"] },
];

const colorKeywordMap = [
  { keywords: ["紫", "紫色"], colorScheme: "neon purple" },
  { keywords: ["蓝", "蓝色"], colorScheme: "electric blue" },
  { keywords: ["青", "青色", "赛博"], colorScheme: "cyan cyber glow" },
  { keywords: ["粉", "粉色"], colorScheme: "pink neon" },
  { keywords: ["暖", "暖色"], colorScheme: "warm amber" },
];

const allAreas = areaKeywordMap.map((item) => item.area);
const globalKeywords = ["整体", "全局", "全部", "整个空间", "全空间"];

function uniqueAreas(areas: RenderingAreaType[]) {
  return Array.from(new Set(areas));
}

export function parseIterationInstruction(instruction: string): ParsedIterationInstruction {
  const normalizedInstruction = instruction.trim().toLowerCase();
  const containsGlobalIntent = globalKeywords.some((keyword) => normalizedInstruction.includes(keyword));
  const affectedAreas = containsGlobalIntent
    ? allAreas
    : uniqueAreas(
        areaKeywordMap
          .filter((item) => item.keywords.some((keyword) => normalizedInstruction.includes(keyword.toLowerCase())))
          .map((item) => item.area)
      );

  const extractedChanges: ParsedIterationInstruction["extractedChanges"] = {};

  if (["更亮", "更强", "增强", "更炫", "高亮"].some((keyword) => normalizedInstruction.includes(keyword))) {
    extractedChanges.rgbDensity = "high";
  } else if (["柔和", "低调", "收一点", "降低"].some((keyword) => normalizedInstruction.includes(keyword))) {
    extractedChanges.rgbDensity = "medium";
  }

  const matchedColor = colorKeywordMap.find((item) => item.keywords.some((keyword) => normalizedInstruction.includes(keyword)));
  if (matchedColor) {
    extractedChanges.colorScheme = matchedColor.colorScheme;
  }

  if (["省一点", "便宜", "降预算", "经济"].some((keyword) => normalizedInstruction.includes(keyword))) {
    extractedChanges.budgetRange = "economy";
  } else if (["高端", "高级", "加预算", "豪华"].some((keyword) => normalizedInstruction.includes(keyword))) {
    extractedChanges.budgetRange = "premium";
  }

  const finalAreas: RenderingAreaType[] = affectedAreas;
  const areaSummary = finalAreas.length > 0 ? finalAreas.join("、") : "未识别具体区域";
  const changeSummary = [
    extractedChanges.rgbDensity ? `灯光强度调整为 ${extractedChanges.rgbDensity}` : null,
    extractedChanges.colorScheme ? `色彩方向调整为 ${extractedChanges.colorScheme}` : null,
    extractedChanges.budgetRange ? `预算等级调整为 ${extractedChanges.budgetRange}` : null,
  ]
    .filter(Boolean)
    .join("；");

  return {
    rawInstruction: instruction,
    normalizedInstruction,
    affectedAreas: finalAreas,
    extractedChanges,
    summary: finalAreas.length === 0
      ? "当前指令尚未识别出明确的重绘区域，请指定吧台、包间、舞台等具体空间后再试。"
      : changeSummary
        ? `将针对 ${areaSummary} 执行局部重绘，并同步应用：${changeSummary}`
        : `将针对 ${areaSummary} 执行局部重绘。`,
  };
}
