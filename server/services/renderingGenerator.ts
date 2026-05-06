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
    cyberpunk: "cyberpunk style, neon lights, futuristic, high contrast",
    futuristic: "futuristic modern style, LED lights, tech feel, cool tones",
    darkgaming: "dark gaming style, RGB lights, esports atmosphere",
    minimalist: "minimalist style, simple design, high-end modern",
    industrial: "industrial style, metal texture, raw materials",
    luxury: "luxury style, high-end decoration, gold accents",
    neon: "neon style, colorful lights, vibrant, dynamic",
    retro: "retro style, vintage elements, warm tones, classic",
  };

  const areaDescriptions: Record<RenderingAreaType, string> = {
    entrance: "nightclub entrance, LED sign, impressive entrance, neon lights",
    corridor: "corridor area, sleek design, lighting guide, spacious",
    bar: "bar counter area, bartender station, high stools, liquor display",
    stage: "stage area, center stage, sound system, colorful lighting",
    seating: `seating area, ${request.machineCount} gaming machines, comfortable seats, RGB lights`,
    private_room: `private rooms, ${request.roomCount} booths, private, high-end sofas`,
    restroom: "restroom area, modern design, clean, bright lighting",
  };

  // Simplified unified prompt
  const unifiedStyle = `
Professional interior design rendering of a ${request.styleTheme} nightclub.
Style: ${styleDescriptions[request.styleTheme] || "modern"}
Color scheme: ${request.colorScheme}
Area: ${areaDescriptions[request.area] || ""}
Lighting: RGB LED lights creating atmosphere
Quality: High-quality 3D rendering, photorealistic, detailed, professional
Space: ${request.totalArea} square meters
  `.trim();

  return unifiedStyle;
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
    console.log(`[Rendering] Generating for area: ${request.area}, prompt length: ${prompt.length}`);
    
    // 调用图像生成API
    const result = await generateImage({
      prompt,
    });
    
    console.log(`[Rendering] Successfully generated image for ${request.area}: ${result.url}`);
    
    return {
      url: result.url || "",
      prompt,
      area: request.area,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Rendering] Failed to generate rendering for area ${request.area}: ${errorMsg}`);
    throw error;
  }
}

/**
 * 生成占位图片（当API失败时使用）
 */
export function generatePlaceholderImage(area: RenderingAreaType, theme: string): string {
  const areaLabels: Record<RenderingAreaType, string> = {
    entrance: "门头",
    corridor: "通道",
    bar: "吧台",
    stage: "舞台",
    seating: "散座",
    private_room: "包间",
    restroom: "卫生间",
  };

  const label = areaLabels[area] || area;
  
  // 创建SVG占位图
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad)"/>
      <circle cx="300" cy="150" r="50" fill="#00ff88" opacity="0.3"/>
      <text x="300" y="250" font-size="32" fill="#00ff88" text-anchor="middle" font-family="Arial">${label}</text>
      <text x="300" y="300" font-size="16" fill="#00ff88" text-anchor="middle" font-family="Arial" opacity="0.6">${theme}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}


/**
 * 为设计方案生成所有区域的效果图
 */
export async function generateDesignRenderings(designId: number, styleTheme: string, colorScheme: string, cadParams: any, rgbDensity: string = "medium"): Promise<Array<{
  area: string;
  label: string;
  url: string;
  prompt: string;
}>> {
  const areas: RenderingAreaType[] = ["entrance", "corridor", "bar", "stage", "seating", "private_room", "restroom"];
  const areaLabels: Record<RenderingAreaType, string> = {
    entrance: "门头",
    corridor: "通道",
    bar: "吧台",
    stage: "舞台",
    seating: "散座",
    private_room: "包间",
    restroom: "卫生间",
  };

  const results: Array<{
    area: string;
    label: string;
    url: string;
    prompt: string;
  }> = [];

  for (const area of areas) {
    try {
      const request: RenderingRequest = {
        styleTheme,
        colorScheme,
        area,
        machineCount: cadParams?.machineCount || 20,
        roomCount: cadParams?.roomCount || 5,
        totalArea: cadParams?.totalArea || 500,
        rgbDensity: "high",
      };

      const rendering = await generateRendering(request);
      results.push({
        area,
        label: areaLabels[area],
        url: rendering.url,
        prompt: rendering.prompt,
      });
    } catch (error) {
      console.error(`[Rendering] Error generating ${area}:`, error);
      // 使用占位图片作为备选
      results.push({
        area,
        label: areaLabels[area],
        url: generatePlaceholderImage(area, styleTheme),
        prompt: "",
      });
    }
  }

  return results;
}
