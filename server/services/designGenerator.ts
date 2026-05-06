/**
 * 设计方案生成服务
 * 基于CAD参数和用户选择生成多种风格方案
 */

import { CADParameters } from "./cadParser";

export interface DesignStyle {
  id: string;
  name: string;
  theme: string;
  colorScheme: string;
  description: string;
  features: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

export interface DesignGenerationRequest {
  cadParameters: CADParameters;
  colorTheme: string; // blue, purple, green, red, multicolor
  budgetRange: "economy" | "standard" | "premium";
  rgbDensity: "low" | "medium" | "high";
  customRequirements?: string;
}

export interface GeneratedDesign {
  id: string;
  styleId: string;
  styleName: string;
  parameters: Record<string, any>;
  estimatedBudget: number;
  promptForImageGeneration: string;
}

/**
 * 风格库定义
 */
const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "cyberpunk",
    name: "赛博朋克",
    theme: "Cyberpunk",
    colorScheme: "Neon Green + Black",
    description: "霓虹灯光、金属质感、高科技感",
    features: ["Dense RGB LED strips", "Matte black walls", "Metal accents", "Neon lighting"],
    budgetRange: { min: 150, max: 200 },
  },
  {
    id: "future_tech",
    name: "未来科技",
    theme: "Future Tech",
    colorScheme: "Blue + White",
    description: "简洁线条、LED屏幕、现代感",
    features: ["Clean lines", "LED displays", "White surfaces", "Minimalist design"],
    budgetRange: { min: 120, max: 150 },
  },
  {
    id: "dark_gaming",
    name: "暗黑竞技",
    theme: "Dark Gaming",
    colorScheme: "Black + Red",
    description: "高端感、沉浸式、专业竞技",
    features: ["Premium materials", "Dark ambiance", "Red accents", "Immersive lighting"],
    budgetRange: { min: 180, max: 250 },
  },
  {
    id: "minimalist",
    name: "极简电竞",
    theme: "Minimalist",
    colorScheme: "Gray + Green",
    description: "专业竞技风格、简洁高效",
    features: ["Professional setup", "Gray tones", "Green accents", "Functional design"],
    budgetRange: { min: 100, max: 130 },
  },
  {
    id: "trendy_bar",
    name: "潮流酒吧",
    theme: "Trendy Bar",
    colorScheme: "Multicolor + Wood",
    description: "社交氛围、温暖感、多彩设计",
    features: ["Social spaces", "Warm lighting", "Colorful design", "Wooden elements"],
    budgetRange: { min: 140, max: 180 },
  },
  {
    id: "party_k",
    name: "Party K",
    theme: "Party K",
    colorScheme: "Neon Purple + Cyan",
    description: "夜场霓虹 + KTV派对氛围 + 潮酷炫光视觉",
    features: ["Neon lights", "KTV atmosphere", "Dynamic RGB", "Party vibes", "Cool neon glow"],
    budgetRange: { min: 180, max: 280 },
  },
  {
    id: "retro_gaming",
    name: "复古电竞",
    theme: "Retro Gaming",
    colorScheme: "Brown + Blue",
    description: "怀旧感 + 现代、独特风格",
    features: ["Retro elements", "Modern touches", "Brown tones", "Blue accents"],
    budgetRange: { min: 110, max: 140 },
  },
  {
    id: "scifi_theater",
    name: "科幻影院",
    theme: "Sci-Fi Theater",
    colorScheme: "Deep Blue + Purple",
    description: "沉浸式体验、未来感、视觉冲击",
    features: ["Immersive experience", "Purple lighting", "Futuristic design", "Theater-like"],
    budgetRange: { min: 160, max: 210 },
  },
];

/**
 * 生成设计方案
 */
export function generateDesigns(request: DesignGenerationRequest): GeneratedDesign[] {
  const designs: GeneratedDesign[] = [];

  // 根据预算范围筛选风格
  const budgetMultiplier = {
    economy: 0.8,
    standard: 1.0,
    premium: 1.2,
  };

  const multiplier = budgetMultiplier[request.budgetRange];

  // 生成5-8个设计方案
  const selectedStyles = selectStyles(request.colorTheme, 6);

  selectedStyles.forEach((style) => {
    const design: GeneratedDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      styleId: style.id,
      styleName: style.name,
      parameters: {
        styleTheme: style.theme,
        colorScheme: style.colorScheme,
        rgbDensity: request.rgbDensity,
        totalArea: request.cadParameters.totalArea,
        machineCount: request.cadParameters.machineCount,
        privateRoomCount: request.cadParameters.privateRoomCount,
        barArea: request.cadParameters.barArea,
        hallArea: request.cadParameters.hallArea,
        vipArea: request.cadParameters.vipArea,
      },
      estimatedBudget: Math.round(
        request.cadParameters.totalArea * (style.budgetRange.min + style.budgetRange.max) * 0.5 * multiplier
      ),
      promptForImageGeneration: generatePrompt(style, request),
    };

    designs.push(design);
  });

  return designs;
}

/**
 * 根据颜色主题选择风格
 */
function selectStyles(colorTheme: string, count: number): DesignStyle[] {
  const colorMap: Record<string, string[]> = {
    blue: ["future_tech", "scifi_theater", "retro_gaming"],
    purple: ["scifi_theater", "party_k", "cyberpunk"],
    green: ["minimalist", "cyberpunk", "trendy_bar"],
    red: ["dark_gaming", "party_k", "cyberpunk"],
    multicolor: ["trendy_bar", "party_k", "scifi_theater"],
  };

  const preferredStyles = colorMap[colorTheme] || [];
  const allStyles = DESIGN_STYLES.filter((s) => !preferredStyles.includes(s.id)).concat(
    DESIGN_STYLES.filter((s) => preferredStyles.includes(s.id))
  );

  return allStyles.slice(0, count);
}

/**
 * 生成图像生成提示词
 */
function generatePrompt(style: DesignStyle, request: DesignGenerationRequest): string {
  const rgbIntensity = {
    low: "subtle RGB lighting",
    medium: "moderate RGB LED strips",
    high: "dense RGB LED strips with intense lighting",
  };

  const prompt = `A professional ${style.theme} esports lounge interior design with ${request.cadParameters.totalArea}sqm area, 
${request.cadParameters.machineCount} gaming stations, ${request.cadParameters.privateRoomCount} private rooms.

Design Style: ${style.name}
Color Scheme: ${style.colorScheme}
RGB Lighting: ${rgbIntensity[request.rgbDensity]}

Key Features:
- Main Hall: ${request.cadParameters.hallArea}sqm with ${style.features.join(", ")}
- Bar Counter: ${request.cadParameters.barArea}sqm with premium design
- VIP Lounge: ${request.cadParameters.vipArea}sqm with luxury seating
- Gaming Stations: Professional setup with ergonomic chairs and high-end monitors

Atmosphere: Professional, immersive, high-end esports venue
Photography Style: Professional architectural rendering, photorealistic, well-lit, 4K quality`;

  return prompt;
}

/**
 * 获取所有可用的设计风格
 */
export function getAvailableStyles(): DesignStyle[] {
  return DESIGN_STYLES;
}

/**
 * 获取特定风格的详细信息
 */
export function getStyleDetails(styleId: string): DesignStyle | null {
  return DESIGN_STYLES.find((s) => s.id === styleId) || null;
}
