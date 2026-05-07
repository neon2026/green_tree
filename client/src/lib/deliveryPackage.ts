import JSZip from "jszip";

export interface DeliveryRenderingItem {
  area: string;
  label: string;
  url: string;
  version?: number;
  isFallback?: boolean;
}

export interface DeliveryPackageInput {
  designId: number;
  projectId: number;
  styleTheme: string;
  budgetRange: string;
  exportedAt?: Date;
  renderings: DeliveryRenderingItem[];
  budgetReport: string;
}

export interface DeliveryPackageMetadata {
  designId: number;
  projectId: number;
  styleTheme: string;
  budgetRange: string;
  exportedAt: string;
  renderings: Array<{
    area: string;
    label: string;
    version: number;
    isFallback: boolean;
    url: string;
  }>;
}

export function buildDeliveryPackageFileName(styleTheme: string | undefined, designId: number) {
  const rawTheme = (styleTheme || "设计方案").replace(/\s+/g, "-");
  return `design-${designId}-${rawTheme}`;
}

export function buildRenderingExportFileName(area: string, version: number | undefined, format: "png" | "jpg") {
  return `${area}-v${version || 1}.${format}`;
}

export function buildDeliveryPackageMetadata(input: DeliveryPackageInput): DeliveryPackageMetadata {
  const exportedAt = (input.exportedAt || new Date()).toISOString();

  return {
    designId: input.designId,
    projectId: input.projectId,
    styleTheme: input.styleTheme || "设计方案",
    budgetRange: input.budgetRange || "未指定",
    exportedAt,
    renderings: input.renderings.map((item) => ({
      area: item.area,
      label: item.label,
      version: item.version || 1,
      isFallback: Boolean(item.isFallback || item.url.startsWith("data:image/")),
      url: item.url,
    })),
  };
}

export function buildDeliveryReadme(metadata: DeliveryPackageMetadata) {
  return `交付包：${metadata.styleTheme}\n设计ID：${metadata.designId}\n项目ID：${metadata.projectId}\n导出时间：${new Date(metadata.exportedAt).toLocaleString()}\n\n包含内容：\n1. 当前效果图（PNG）\n2. 预算报表（Markdown）\n3. 元数据说明（JSON）\n`;
}

export async function buildDeliveryPackageZip(
  input: DeliveryPackageInput,
  fetcher: (url: string) => Promise<Uint8Array>
) {
  const zip = new JSZip();
  const renderingsFolder = zip.folder("renderings");
  const reportFolder = zip.folder("reports");
  const metadata = buildDeliveryPackageMetadata(input);

  reportFolder?.file("budget-report.md", input.budgetReport || "预算报表暂未生成");
  zip.file("README.txt", buildDeliveryReadme(metadata));
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  await Promise.all(
    input.renderings
      .filter((item) => item.url)
      .map(async (item) => {
        const safeLabel = item.label.replace(/\s+/g, "-");
        const fileBytes = await fetcher(item.url);
        renderingsFolder?.file(`${item.area}-${safeLabel}-v${item.version || 1}.png`, fileBytes);
      })
  );

  return zip;
}
