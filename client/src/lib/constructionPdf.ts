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

export function buildConstructionPdfLines(input: ConstructionPdfInput) {
  const cadParameters = input.cadParameters || {};
  const notes = input.notes?.filter(Boolean) || [];

  return [
    `项目名称：${input.projectName || `项目 ${input.projectId}`}`,
    `项目 ID：${input.projectId}`,
    `设计 ID：${input.designId}`,
    `风格主题：${input.styleTheme || "未指定"}`,
    `颜色方案：${input.colorScheme || "未指定"}`,
    `预算区间：${input.budgetRange || "未指定"}`,
    "",
    "CAD 参数摘要：",
    `- 总面积：${normalizeCadValue(cadParameters.totalArea)} ㎡`,
    `- 机位数量：${normalizeCadValue(cadParameters.machineCount)}`,
    `- 包间数量：${normalizeCadValue(cadParameters.roomCount ?? cadParameters.privateRoomCount)}`,
    `- 吧台面积：${normalizeCadValue(cadParameters.barArea)} ㎡`,
    `- 大厅面积：${normalizeCadValue(cadParameters.hallArea)} ㎡`,
    `- VIP 面积：${normalizeCadValue(cadParameters.vipArea)} ㎡`,
    "",
    "施工说明：",
    ...(notes.length > 0
      ? notes.map((note, index) => `${index + 1}. ${note}`)
      : [
          "1. 当前导出为施工说明 PDF，可用于方案沟通、施工前核对与交付归档。",
          "2. DWG 结构化施工图仍保留为后续扩展入口，当前版本尚未生成 CAD 级别图纸。",
          "3. 如图像服务受限，请结合效果图占位图提示与预算报表一起审阅。",
        ]),
  ];
}

export function buildConstructionPdfDocument(input: ConstructionPdfInput) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const lines = buildConstructionPdfLines(input);

  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, 595, 842, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("绿树电竞 AI 施工说明", 40, 56);

  pdf.setTextColor(148, 163, 184);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`导出时间：${new Date().toLocaleString()}`, 40, 76);

  pdf.setTextColor(226, 232, 240);
  pdf.setFontSize(11);

  let cursorY = 116;
  for (const line of lines) {
    const wrapped = pdf.splitTextToSize(line, 515);
    pdf.text(wrapped, 40, cursorY);
    cursorY += wrapped.length * 16 + 4;

    if (cursorY > 780) {
      pdf.addPage();
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 595, 842, "F");
      pdf.setTextColor(226, 232, 240);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      cursorY = 56;
    }
  }

  return pdf;
}
