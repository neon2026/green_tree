import { jsPDF } from "jspdf";

export interface ConstructionPdfInput {
  projectId: number;
  designId: number;
  projectName: string;
  styleTheme?: string | null;
  colorScheme?: string | null;
  budgetRange?: string | null;
  cadParameters?: Record<string, unknown> | null;
  notes?: string[];
}

interface NormalizedCadParameters {
  totalArea: number;
  machineCount: number;
  roomCount: number;
  barArea: number;
  hallArea: number;
  vipArea: number;
  restroomArea: number;
  corridorArea: number;
  stageArea: number;
  entranceArea: number;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

export function buildConstructionPdfFileName(projectId: number, designId: number) {
  return `construction-${projectId}-${designId}.pdf`;
}

function normalizeCadValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "未提供";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function normalizePositiveNumber(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function normalizeCadParameters(cadParameters?: Record<string, unknown> | null): NormalizedCadParameters {
  const raw = cadParameters || {};
  const totalArea = normalizePositiveNumber(raw.totalArea, 500);
  const roomCount = normalizePositiveNumber(raw.roomCount ?? raw.privateRoomCount, 5);
  const machineCount = normalizePositiveNumber(raw.machineCount, 20);
  const barArea = normalizePositiveNumber(raw.barArea, Math.max(totalArea * 0.1, 35));
  const hallArea = normalizePositiveNumber(raw.hallArea, Math.max(totalArea * 0.34, 120));
  const vipArea = normalizePositiveNumber(raw.vipArea, Math.max(roomCount * 18, 72));
  const restroomArea = normalizePositiveNumber(raw.restroomArea, Math.max(totalArea * 0.05, 20));
  const corridorArea = normalizePositiveNumber(raw.corridorArea, Math.max(totalArea * 0.08, 30));
  const stageArea = normalizePositiveNumber(raw.stageArea, Math.max(totalArea * 0.09, 36));
  const entranceArea = normalizePositiveNumber(raw.entranceArea, Math.max(totalArea * 0.06, 24));

  return {
    totalArea,
    machineCount,
    roomCount,
    barArea,
    hallArea,
    vipArea,
    restroomArea,
    corridorArea,
    stageArea,
    entranceArea,
  };
}

function formatArea(area: number) {
  return `${area.toFixed(0)} ㎡`;
}

function drawPageBackground(pdf: jsPDF) {
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
}

function drawPageTitle(pdf: jsPDF, title: string, subtitle?: string) {
  drawPageBackground(pdf);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(248, 250, 252);
  pdf.text(title, 40, 52);
  if (subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text(subtitle, 40, 72);
  }
}

function drawCoverPage(pdf: jsPDF, input: ConstructionPdfInput, cad: NormalizedCadParameters) {
  drawPageTitle(pdf, "绿树电竞 AI 施工图交付 PDF", `导出时间：${new Date().toLocaleString()}`);

  pdf.setDrawColor(56, 189, 248);
  pdf.setFillColor(15, 31, 64);
  pdf.roundedRect(36, 108, 523, 170, 16, 16, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(input.projectName || `项目 ${input.projectId}`, 56, 144);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(191, 219, 254);
  const summaryLines = [
    `项目 ID：${input.projectId}`,
    `设计 ID：${input.designId}`,
    `风格主题：${input.styleTheme || "未指定"}`,
    `颜色方案：${input.colorScheme || "未指定"}`,
    `预算区间：${input.budgetRange || "未指定"}`,
    `总面积：${formatArea(cad.totalArea)} · 机位：${cad.machineCount} · 包间：${cad.roomCount}`,
  ];
  let y = 176;
  for (const line of summaryLines) {
    pdf.text(line, 56, y);
    y += 20;
  }

  pdf.setFillColor(30, 41, 59);
  pdf.roundedRect(36, 304, 523, 474, 16, 16, "F");
  pdf.setTextColor(226, 232, 240);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("交付内容概览", 56, 336);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const contentLines = [
    "1. 平面布局示意页：基于当前 CAD 参数生成区域分区与面积配置。",
    "2. 区域配比页：展示门头、通道、吧台、舞台、散座、包间、卫生间的施工建议。",
    "3. 机位与包间配置页：用于现场复核机位数量、包间数量与预算级别。",
    ...(input.notes?.filter(Boolean) || []),
  ];
  y = 368;
  for (const line of contentLines) {
    const wrapped = pdf.splitTextToSize(line, 475);
    pdf.text(wrapped, 56, y);
    y += wrapped.length * 16 + 8;
  }
}

function drawLayoutPlanPage(pdf: jsPDF, cad: NormalizedCadParameters) {
  pdf.addPage();
  drawPageTitle(pdf, "平面布局示意", "基于当前 CAD 参数自动生成的施工图 PDF 示意页");

  const planX = 46;
  const planY = 112;
  const planW = 500;
  const planH = 610;
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(15, 31, 64);
  pdf.roundedRect(planX, planY, planW, planH, 18, 18, "FD");

  const layoutAreas = [
    { key: "hall", label: "大厅 / 散座", area: cad.hallArea, x: planX + 20, y: planY + 24, w: 285, h: 238, fill: [30, 64, 175] as const },
    { key: "private", label: `包间区 × ${cad.roomCount}`, area: cad.vipArea, x: planX + 322, y: planY + 24, w: 204, h: 238, fill: [91, 33, 182] as const },
    { key: "bar", label: "吧台", area: cad.barArea, x: planX + 20, y: planY + 286, w: 160, h: 128, fill: [8, 145, 178] as const },
    { key: "stage", label: "舞台", area: cad.stageArea, x: planX + 194, y: planY + 286, w: 150, h: 128, fill: [190, 24, 93] as const },
    { key: "corridor", label: "通道", area: cad.corridorArea, x: planX + 360, y: planY + 286, w: 166, h: 128, fill: [71, 85, 105] as const },
    { key: "entrance", label: "门头 / 前厅", area: cad.entranceArea, x: planX + 20, y: planY + 438, w: 240, h: 108, fill: [14, 116, 144] as const },
    { key: "restroom", label: "卫生间", area: cad.restroomArea, x: planX + 276, y: planY + 438, w: 250, h: 108, fill: [22, 101, 52] as const },
  ];

  for (const block of layoutAreas) {
    pdf.setFillColor(block.fill[0], block.fill[1], block.fill[2]);
    pdf.roundedRect(block.x, block.y, block.w, block.h, 12, 12, "F");
    pdf.setTextColor(248, 250, 252);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(block.label, block.x + 14, block.y + 24);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`建议面积：${formatArea(block.area)}`, block.x + 14, block.y + 46);
  }

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineDashPattern([6, 4], 0);
  pdf.line(planX + 20, planY + 566, planX + 526, planY + 566);
  pdf.setLineDashPattern([], 0);
  pdf.setTextColor(148, 163, 184);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`总面积：${formatArea(cad.totalArea)} · 机位：${cad.machineCount} · 包间：${cad.roomCount}`, planX + 24, planY + 590);
}

function drawSchedulePage(pdf: jsPDF, input: ConstructionPdfInput, cad: NormalizedCadParameters) {
  pdf.addPage();
  drawPageTitle(pdf, "区域与机位配置表", "用于施工前核对空间分区、设备布置与预算等级");

  const rows = [
    ["门头 / 前厅", formatArea(cad.entranceArea), "LOGO 发光字、迎宾导视、品牌色灯带"],
    ["通道", formatArea(cad.corridorArea), "耐磨地面、导视灯条、消防净空"],
    ["吧台", formatArea(cad.barArea), "收银台、电源预留、酒水陈列与背柜照明"],
    ["舞台", formatArea(cad.stageArea), "主屏、音响吊点、可编程灯光与检修通道"],
    ["大厅 / 散座", formatArea(cad.hallArea), `机位约 ${cad.machineCount} 台，注意供电与散热组织`],
    ["包间区", formatArea(cad.vipArea), `独立包间约 ${cad.roomCount} 间，建议隔音墙体与独立回风`],
    ["卫生间", formatArea(cad.restroomArea), "上下水、排风与防滑地面"],
    ["预算等级", input.budgetRange || "未指定", "结合材料清单与预算报表复核"],
  ];

  const startX = 40;
  let cursorY = 118;
  const columns = [120, 100, 295] as const;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(226, 232, 240);
  pdf.setFillColor(30, 41, 59);
  pdf.roundedRect(startX, cursorY, columns[0] + columns[1] + columns[2], 28, 8, 8, "F");
  pdf.text("区域", startX + 12, cursorY + 18);
  pdf.text("面积 / 数量", startX + columns[0] + 12, cursorY + 18);
  pdf.text("施工建议", startX + columns[0] + columns[1] + 12, cursorY + 18);
  cursorY += 40;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  for (const [label, metric, note] of rows) {
    const height = Math.max(34, pdf.splitTextToSize(note, columns[2] - 24).length * 14 + 14);
    pdf.setDrawColor(71, 85, 105);
    pdf.roundedRect(startX, cursorY, columns[0], height, 6, 6, "S");
    pdf.roundedRect(startX + columns[0], cursorY, columns[1], height, 6, 6, "S");
    pdf.roundedRect(startX + columns[0] + columns[1], cursorY, columns[2], height, 6, 6, "S");

    pdf.setTextColor(226, 232, 240);
    pdf.text(label, startX + 12, cursorY + 20);
    pdf.text(metric, startX + columns[0] + 12, cursorY + 20);
    pdf.text(pdf.splitTextToSize(note, columns[2] - 24), startX + columns[0] + columns[1] + 12, cursorY + 20);
    cursorY += height + 10;
  }
}

export function buildConstructionPdfLines(input: ConstructionPdfInput) {
  const cad = normalizeCadParameters(input.cadParameters || {});
  const notes = input.notes?.filter(Boolean) || [];
  return [
    `项目名称：${input.projectName || `项目 ${input.projectId}`}`,
    `项目 ID：${input.projectId}`,
    `设计 ID：${input.designId}`,
    `风格主题：${input.styleTheme || "未指定"}`,
    `颜色方案：${input.colorScheme || "未指定"}`,
    `预算区间：${input.budgetRange || "未指定"}`,
    "",
    "施工图 PDF 页面摘要：",
    `- 平面布局示意：总面积 ${formatArea(cad.totalArea)}，覆盖门头、通道、吧台、舞台、散座、包间、卫生间。`,
    `- 机位与包间配置：机位 ${cad.machineCount} 台，包间 ${cad.roomCount} 间。`,
    `- 区域配置表：包含吧台 ${formatArea(cad.barArea)}、大厅 ${formatArea(cad.hallArea)}、包间 ${formatArea(cad.vipArea)}。`,
    "",
    "施工说明：",
    ...(notes.length > 0
      ? notes.map((note, index) => `${index + 1}. ${note}`)
      : [
          "1. 当前导出基于现有 CAD 参数生成布局示意与区域配置表，可用于方案沟通、施工前核对与交付归档。",
          "2. 若 constructions 表中已有 DWG / PDF 真正图纸文件，可结合页面中的真实文件下载入口一起交付。",
          "3. 如图像服务受限，请结合效果图占位图提示、预算报表与本 PDF 一起审阅。",
        ]),
  ];
}

export function buildConstructionPdfDocument(input: ConstructionPdfInput) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const cad = normalizeCadParameters(input.cadParameters || {});
  drawCoverPage(pdf, input, cad);
  drawLayoutPlanPage(pdf, cad);
  drawSchedulePage(pdf, input, cad);
  return pdf;
}
