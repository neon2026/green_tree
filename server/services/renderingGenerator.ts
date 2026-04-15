/**
 * 效果图生成服务
 * 负责生成效果图提示词和调用图像生成API
 * 支持7个区域：门头、通道、吧台、舞台、散座、包间、卫生间
 */

import { generateImage } from "../_core/imageGeneration";

export type RenderingAreaType = 
  | "entrance" 
  | "corridor" 
  | "bar" 
  | "stage" 
  | "seating" 
  | "private_room" 
  | "restroom";

export interface RenderingRequest {
  styleTheme: string;
  colorScheme: string;
  area: RenderingAreaType;
  machineCount: number;
  roomCount: number;
  totalArea: number;
  rgbDensity: "low" | "medium" | "high";
}

/**
 * 为不同区域生成效果图提示词
 * 确保所有区域使用统一的风格和设计语言
 */
export function generateRenderingPrompt(request: RenderingRequest): string {
  const styleDescriptions: Record<string, string> = {
    cyberpunk: "赛博朋克风格，霓虹灯光，未来科技感，高对比度，深色调为主",
    futuristic: "未来科技风格，简洁现代，LED灯带，科技感十足，冷色调",
    darkgaming: "暗黑竞技风格，深色调，RGB灯光，电竞氛围，视觉冲击强",
    minimalist: "极简风格，简洁设计，功能性强，高端大气，留白充分",
    industrial: "工业风格，金属感，粗糙质感，个性十足，原始材料",
    luxury: "奢华风格，高端装修，金色装饰，尊贵感，精致细节",
    neon: "霓虹风格，彩色灯光，年轻活力，动感十足，多彩配色",
    retro: "复古风格，怀旧元素，温暖色调，舒适感，经典设计",
  };

  const areaDescriptions: Record<RenderingAreaType, string> = {
    entrance: `门头区域，品牌标识清晰，入口大气恢宏，LED招牌闪烁，吸引力强`,
    corridor: `通道区域，流线型设计，灯光引导，宽敞舒适，连接各区域`,
    bar: `吧台区域，调酒台设计精良，高脚椅排列整齐，酒柜展示精致，${request.rgbDensity === "high" ? "密集RGB灯带营造氛围" : "适度RGB灯带"}`,
    stage: `舞台区域，中心舞台设计，音响系统完善，灯光效果炫彩，观众视野开阔`,
    seating: `散座区域，${request.machineCount}个游戏机位分布合理，座椅舒适，${request.rgbDensity === "high" ? "RGB灯带密集分布" : "RGB灯带均匀分布"}`,
    private_room: `包间区域，${request.roomCount}个独立包间，私密性强，独立空调，高级沙发，隔音效果好`,
    restroom: `卫生间区域，现代简洁设计，照明充足，通风良好，卫生整洁，高端装修`,
  };

  const rgbDescriptions: Record<string, string> = {
    low: "RGB灯带适度分布，重点照亮关键区域，营造舒适氛围",
    medium: "RGB灯带均匀分布，营造电竞氛围，视觉层次丰富",
    high: "RGB灯带密集分布，全方位照亮，视觉冲击强，炫彩效果",
  };

  // 统一的设计语言和质量要求
  const unifiedStyle = `
    设计风格：${styleDescriptions[request.styleTheme] || "现代风格"}
    色彩方案：${request.colorScheme}
    区域描述：${areaDescriptions[request.area] || ""}
    灯光配置：${rgbDescriptions[request.rgbDensity] || ""}
    
    设计要求：
    - 整体风格协调统一，与其他区域相呼应
    - 高质量室内设计效果图，专业渲染，细节丰富
    - 光影逼真，材质质感强，空间感十足
    - 人物活动场景自然，营造真实的使用氛围
    - 色彩搭配和谐，灯光效果恰到好处
    - 总面积参考：${request.totalArea}平方米
  `;

  return unifiedStyle.trim();
}

/**
 * 生成效果图
 */
export async function generateRendering(request: RenderingRequest): Promise<{
  url: string;
  prompt: string;
  area: string;
}> {
  try {
    const prompt = generateRenderingPrompt(request);

    // 调用图像生成API
    const result = await generateImage({
      prompt,
    });

    return {
      url: result.url || "",
      prompt,
      area: request.area,
    };
  } catch (error) {
    console.error("Failed to generate rendering:", error);
    throw new Error("效果图生成失败，请稍后重试");
  }
}

/**
 * 批量生成多个区域的效果图
 */
export async function generateMultipleRenderings(
  request: Omit<RenderingRequest, "area">,
  areas: RenderingAreaType[]
): Promise<Array<{ url: string; prompt: string; area: string }>> {
  const results = [];

  for (const area of areas) {
    try {
      const result = await generateRendering({
        ...request,
        area,
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to generate rendering for area ${area}:`, error);
      // 继续生成其他区域
    }
  }

  return results;
}

/**
 * 为设计方案生成所有区域的效果图
 * 7个区域：门头、通道、吧台、舞台、散座、包间、卫生间
 */
export async function generateDesignRenderings(
  designId: number,
  styleTheme: string,
  colorScheme: string,
  cadParameters: {
    totalArea: number;
    machineCount: number;
    roomCount: number;
  },
  rgbDensity: "low" | "medium" | "high"
): Promise<Array<{ url: string; prompt: string; area: string }>> {
  const areas: RenderingAreaType[] = [
    "entrance",
    "corridor",
    "bar",
    "stage",
    "seating",
    "private_room",
    "restroom",
  ];

  return generateMultipleRenderings(
    {
      styleTheme,
      colorScheme,
      machineCount: cadParameters.machineCount,
      roomCount: cadParameters.roomCount,
      totalArea: cadParameters.totalArea,
      rgbDensity,
    },
    areas
  );
}

/**
 * 获取所有区域的中文名称
 */
export function getAreaLabel(area: RenderingAreaType): string {
  const labels: Record<RenderingAreaType, string> = {
    entrance: "门头",
    corridor: "通道",
    bar: "吧台",
    stage: "舞台",
    seating: "散座",
    private_room: "包间",
    restroom: "卫生间",
  };
  return labels[area] || area;
}

/**
 * 获取所有区域列表
 */
export function getAllAreas(): Array<{ id: RenderingAreaType; label: string }> {
  return [
    { id: "entrance", label: "门头" },
    { id: "corridor", label: "通道" },
    { id: "bar", label: "吧台" },
    { id: "stage", label: "舞台" },
    { id: "seating", label: "散座" },
    { id: "private_room", label: "包间" },
    { id: "restroom", label: "卫生间" },
  ];
}
