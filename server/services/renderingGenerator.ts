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

export interface RenderingResult {
  url: string;
  prompt: string;
  area: string;
  isFallback?: boolean;
  fallbackReason?: string;
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
    party_k: "party K nightlife style, neon purple and cyan, KTV party atmosphere, cool glossy lighting, immersive entertainment space",
    neon: "neon style, colorful lights, vibrant, dynamic",
    retro: "retro style, vintage elements, warm tones, classic",
  };

  const areaDescriptions: Record<RenderingAreaType, string> = {
    entrance: "party K entrance, neon sign facade, nightlife arrival moment, cyan and purple glow",
    corridor: "party corridor area, reflective surfaces, directional light strips, immersive nightlife transition",
    bar: "party bar counter area, bartender station, glossy materials, cocktail nightlife mood",
    stage: "party stage area, karaoke performance focus, sound system, dramatic lighting beams",
    seating: `open seating area, ${request.machineCount} entertainment seats, booth sofas, lively party lighting`,
    private_room: `private KTV rooms, ${request.roomCount} themed booths, plush sofas, intimate party atmosphere`,
    restroom: "restroom area, stylish hospitality finish, clean design, coordinated accent lighting",
  };

  const unifiedStyle = `
Professional interior design rendering of a Party K nightlife entertainment venue.
Theme keyword: ${request.styleTheme}
Style: ${styleDescriptions[request.styleTheme] || "modern nightlife entertainment interior"}
Color scheme: ${request.colorScheme}
Area focus: ${areaDescriptions[request.area] || ""}
Lighting: RGB LED lights, neon purple and cyan accents, immersive party atmosphere
Mood: trendy, energetic, premium, cohesive visual language across all areas
Quality: high-quality 3D rendering, photorealistic, detailed, professional interior visualization
Space: ${request.totalArea} square meters
  `.trim();

  return unifiedStyle;
}

function normalizeFallbackReason(rawReason: string) {
  if (rawReason.toLowerCase().includes("usage exhausted")) {
    return "当前图像服务额度已用尽，系统已自动展示占位图。可稍后重试，或切换到其他可用图像服务后再生成真实效果图。";
  }

  return `当前图像服务暂时不可用，系统已自动展示占位图。原始原因：${rawReason}`;
}

/**
 * 生成效果图
 */
export async function generateRendering(request: RenderingRequest): Promise<RenderingResult> {
  const prompt = generateRenderingPrompt(request);

  try {
    console.log(`[Rendering] Generating for area: ${request.area}, prompt length: ${prompt.length}`);

    const result = await generateImage({
      prompt,
    });

    console.log(`[Rendering] Successfully generated image for ${request.area}: ${result.url}`);

    return {
      url: result.url || generatePlaceholderImage(request.area, request.styleTheme),
      prompt,
      area: request.area,
      isFallback: !result.url,
      fallbackReason: !result.url
        ? "图像服务未返回有效图片地址，系统已自动展示占位图。"
        : undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const fallbackReason = normalizeFallbackReason(errorMsg);
    console.error(`[Rendering] Failed to generate rendering for area ${request.area}: ${errorMsg}`);

    return {
      url: generatePlaceholderImage(request.area, request.styleTheme),
      prompt,
      area: request.area,
      isFallback: true,
      fallbackReason,
    };
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
export async function generateDesignRenderings(
  designId: number,
  styleTheme: string,
  colorScheme: string,
  cadParams: any,
  rgbDensity: string = "medium"
): Promise<
  Array<{
    area: string;
    label: string;
    url: string;
    prompt: string;
    isFallback?: boolean;
    fallbackReason?: string;
  }>
> {
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
    isFallback?: boolean;
    fallbackReason?: string;
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
        rgbDensity: (rgbDensity as "low" | "medium" | "high") || "high",
      };

      const rendering = await generateRendering(request);
      results.push({
        area,
        label: areaLabels[area],
        url: rendering.url,
        prompt: rendering.prompt,
        isFallback: rendering.isFallback,
        fallbackReason: rendering.fallbackReason,
      });
    } catch (error) {
      console.error(`[Rendering] Error generating ${area}:`, error);
      results.push({
        area,
        label: areaLabels[area],
        url: generatePlaceholderImage(area, styleTheme),
        prompt: "",
        isFallback: true,
        fallbackReason: "效果图生成过程中出现异常，系统已自动展示占位图。",
      });
    }
  }

  return results;
}
