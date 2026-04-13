/**
 * 效果图生成服务
 * 负责生成效果图提示词和调用图像生成API
 */

import { generateImage } from "../_core/imageGeneration";

export interface RenderingArea {
  name: string;
  prompt: string;
  description: string;
}

export interface RenderingRequest {
  styleTheme: string;
  colorScheme: string;
  area: "hall" | "bar" | "vip" | "gaming";
  machineCount: number;
  roomCount: number;
  totalArea: number;
  rgbDensity: "low" | "medium" | "high";
}

/**
 * 为不同区域生成效果图提示词
 */
export function generateRenderingPrompt(request: RenderingRequest): string {
  const styleDescriptions: Record<string, string> = {
    cyberpunk: "赛博朋克风格，霓虹灯光，未来科技感，高对比度",
    futuristic: "未来科技风格，简洁现代，LED灯带，科技感十足",
    darkgaming: "暗黑竞技风格，深色调，RGB灯光，电竞氛围",
    minimalist: "极简风格，简洁设计，功能性强，高端大气",
    industrial: "工业风格，金属感，粗糙质感，个性十足",
    luxury: "奢华风格，高端装修，金色装饰，尊贵感",
    neon: "霓虹风格，彩色灯光，年轻活力，动感十足",
    retro: "复古风格，怀旧元素，温暖色调，舒适感",
  };

  const areaDescriptions: Record<string, string> = {
    hall: `主大厅，${request.machineCount}个游戏机位，开放式布局，中心舞台区域`,
    bar: `吧台区域，调酒台，高脚椅，酒柜展示，${request.rgbDensity === "high" ? "密集RGB灯带" : "适度RGB灯带"}`,
    vip: `VIP包间，${request.roomCount}个包间，私密性强，独立空调，高级沙发`,
    gaming: `游戏区，${request.machineCount}个游戏机，竞技氛围，观众区，解说台`,
  };

  const rgbDescriptions: Record<string, string> = {
    low: "RGB灯带适度分布，重点照亮关键区域",
    medium: "RGB灯带均匀分布，营造电竞氛围",
    high: "RGB灯带密集分布，全方位照亮，视觉冲击强",
  };

  const basePrompt = `
    ${styleDescriptions[request.styleTheme] || "现代风格"}
    ${areaDescriptions[request.area] || ""}
    ${rgbDescriptions[request.rgbDensity] || ""}
    色彩方案：${request.colorScheme}
    总面积：${request.totalArea}平方米
    高质量室内设计效果图，专业渲染，细节丰富，光影逼真
  `;

  return basePrompt.trim();
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
  areas: Array<"hall" | "bar" | "vip" | "gaming">
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
  const areas: Array<"hall" | "bar" | "vip" | "gaming"> = [
    "hall",
    "bar",
    "vip",
    "gaming",
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
