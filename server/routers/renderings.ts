import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateDesignRenderings,
  generateRendering,
  type RenderingAreaType,
} from "../services/renderingGenerator";
import {
  createIteration,
  createRendering,
  getDesignById,
  getLatestRenderingsByArea,
  getProjectRenderingHistory,
  getRenderingHistory,
  updateDesign,
} from "../db-helpers";
import { parseIterationInstruction } from "../services/iterationInstruction";

const renderingAreas = [
  "entrance",
  "corridor",
  "bar",
  "stage",
  "seating",
  "private_room",
  "restroom",
] as const;

const areaLabels: Record<RenderingAreaType, string> = {
  entrance: "门头",
  corridor: "通道",
  bar: "吧台",
  stage: "舞台",
  seating: "散座",
  private_room: "包间",
  restroom: "卫生间",
};

function buildCadParameters(raw: unknown) {
  const params = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const cadParameters = (params.cadParameters && typeof params.cadParameters === "object"
    ? params.cadParameters
    : {}) as Record<string, unknown>;

  return {
    totalArea: Number(cadParameters.totalArea ?? 500),
    machineCount: Number(cadParameters.machineCount ?? 20),
    roomCount: Number(cadParameters.roomCount ?? 5),
    rgbDensity: String(params.rgbDensity ?? "high") as "low" | "medium" | "high",
  };
}

function normalizeStyleTheme(styleTheme?: string | null) {
  if (!styleTheme) return "Party K";
  if (styleTheme === "party_k" || styleTheme === "partyk") return "Party K";
  return styleTheme
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildFallbackSummary(renderings: Array<{ isFallback?: boolean; fallbackReason?: string | null }>) {
  const fallbackItems = renderings.filter((item) => item.isFallback);
  if (fallbackItems.length === 0) {
    return {
      fallbackCount: 0,
      warningMessage: null,
    };
  }

  const primaryReason = fallbackItems.find((item) => item.fallbackReason)?.fallbackReason;
  return {
    fallbackCount: fallbackItems.length,
    warningMessage:
      primaryReason || `有 ${fallbackItems.length} 张效果图暂未生成真实图片，系统已自动展示占位图。`,
  };
}

function normalizeRendering(record: {
  id?: number;
  designId?: number | null;
  areaType?: string | null;
  imageUrl?: string | null;
  version?: number | null;
  createdAt?: Date | null;
  styleTheme?: string | null;
}) {
  const area = (record.areaType || "entrance") as RenderingAreaType;
  return {
    id: record.id ?? 0,
    designId: record.designId ?? 0,
    area,
    label: areaLabels[area] || area,
    url: record.imageUrl || "",
    version: record.version ?? 1,
    createdAt: record.createdAt?.toISOString?.() ?? null,
    styleTheme: normalizeStyleTheme(record.styleTheme),
  };
}

async function persistGeneratedRendering({
  designId,
  area,
  version,
  rendering,
}: {
  designId: number;
  area: RenderingAreaType;
  version: number;
  rendering: Awaited<ReturnType<typeof generateRendering>>;
}) {
  const result = await createRendering({
    designId,
    imageUrl: rendering.url,
    imageKey: `design_${designId}_${area}_v${version}`,
    areaType: area,
    version,
  });

  return {
    id: (result as any).insertId || 0,
    area,
    label: areaLabels[area],
    url: rendering.url,
    prompt: rendering.prompt,
    version,
    isFallback: rendering.isFallback || false,
    fallbackReason: rendering.fallbackReason || null,
  };
}

export const renderingsRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      try {
        const parameters = JSON.parse(design.parameters || "{}");
        const cadParameters = buildCadParameters(parameters);
        const normalizedStyleTheme = design.styleTheme === "partyk" ? "party_k" : design.styleTheme;
        const styleTheme = normalizedStyleTheme || "party_k";
        const colorScheme = design.colorScheme || "neon purple and cyan";
        const history = await getRenderingHistory(input.designId);
        const versionCounter = new Map<string, number>();

        for (const item of history) {
          const currentVersion = versionCounter.get(item.areaType || "") || 0;
          versionCounter.set(item.areaType || "", Math.max(currentVersion, item.version || 1));
        }

        const generated = await generateDesignRenderings(
          input.designId,
          styleTheme,
          colorScheme,
          cadParameters,
          cadParameters.rgbDensity
        );

        const savedRenderings = [];
        for (const rendering of generated) {
          const nextVersion = (versionCounter.get(rendering.area) || 0) + 1;
          versionCounter.set(rendering.area, nextVersion);

          savedRenderings.push(
            await persistGeneratedRendering({
              designId: input.designId,
              area: rendering.area as RenderingAreaType,
              version: nextVersion,
              rendering,
            })
          );
        }

        return {
          success: true,
          ...buildFallbackSummary(savedRenderings),
          renderings: savedRenderings,
        };
      } catch (error) {
        console.error("Failed to generate renderings:", error);
        throw new Error("效果图生成失败，请稍后重试");
      }
    }),

  iterate: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
        instruction: z.string().min(1, "请输入修改指令"),
      })
    )
    .mutation(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      try {
        const parsed = parseIterationInstruction(input.instruction);
        if (parsed.affectedAreas.length === 0) {
          return {
            success: false,
            summary: parsed.summary,
            affectedAreas: [] as RenderingAreaType[],
            fallbackCount: 0,
            warningMessage: "请明确说明要调整的区域，例如吧台、包间、舞台或整体空间。",
            renderings: [],
          };
        }

        const parameters = JSON.parse(design.parameters || "{}");
        const cadParameters = buildCadParameters(parameters);
        const styleTheme = (design.styleTheme === "partyk" ? "party_k" : design.styleTheme) || "party_k";
        const colorScheme = parsed.extractedChanges.colorScheme || design.colorScheme || "neon purple and cyan";
        const rgbDensity = parsed.extractedChanges.rgbDensity || cadParameters.rgbDensity;
        const budgetRange = parsed.extractedChanges.budgetRange || design.budgetRange || "standard";
        const history = await getRenderingHistory(input.designId);
        const versionCounter = new Map<string, number>();

        for (const item of history) {
          const currentVersion = versionCounter.get(item.areaType || "") || 0;
          versionCounter.set(item.areaType || "", Math.max(currentVersion, item.version || 1));
        }

        const nextParameters = {
          ...parameters,
          rgbDensity,
          iterationHints: {
            lastInstruction: input.instruction,
            affectedAreas: parsed.affectedAreas,
            extractedChanges: parsed.extractedChanges,
          },
        };

        await updateDesign(input.designId, {
          colorScheme,
          budgetRange,
          parameters: JSON.stringify(nextParameters),
        });

        const savedRenderings = [];
        for (const area of parsed.affectedAreas) {
          const rendering = await generateRendering({
            styleTheme,
            colorScheme,
            area,
            machineCount: cadParameters.machineCount,
            roomCount: cadParameters.roomCount,
            totalArea: cadParameters.totalArea,
            rgbDensity,
          });

          const nextVersion = (versionCounter.get(area) || 0) + 1;
          versionCounter.set(area, nextVersion);
          savedRenderings.push(
            await persistGeneratedRendering({
              designId: input.designId,
              area,
              version: nextVersion,
              rendering,
            })
          );
        }

        await createIteration({
          designId: input.designId,
          instruction: input.instruction,
          parameterChanges: JSON.stringify({
            affectedAreas: parsed.affectedAreas,
            extractedChanges: parsed.extractedChanges,
            summary: parsed.summary,
          }),
          imageUrl: savedRenderings[0]?.url || null,
          imageKey: `iteration_${input.designId}_${Date.now()}`,
        });

        return {
          success: true,
          summary: parsed.summary,
          affectedAreas: parsed.affectedAreas,
          ...buildFallbackSummary(savedRenderings),
          renderings: savedRenderings,
        };
      } catch (error) {
        console.error("Failed to iterate renderings:", error);
        throw new Error("局部重绘失败，请稍后重试");
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const design = await getDesignById(input.designId);
        if (!design) {
          throw new Error("设计方案不存在");
        }

        const [latestRenderings, history] = await Promise.all([
          getLatestRenderingsByArea(input.designId),
          getProjectRenderingHistory(design.projectId),
        ]);

        return {
          renderings: latestRenderings.map((item) =>
            normalizeRendering({ ...item, styleTheme: design.styleTheme })
          ),
          history: history.map(normalizeRendering),
        };
      } catch (error) {
        console.error("Failed to list renderings:", error);
        throw new Error("获取效果图列表失败");
      }
    }),

  regenerateArea: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
        area: z.enum(renderingAreas),
      })
    )
    .mutation(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      try {
        const parameters = JSON.parse(design.parameters || "{}");
        const cadParameters = buildCadParameters(parameters);
        const normalizedStyleTheme = design.styleTheme === "partyk" ? "party_k" : design.styleTheme;
        const styleTheme = normalizedStyleTheme || "party_k";
        const colorScheme = design.colorScheme || "neon purple and cyan";
        const history = await getRenderingHistory(input.designId);
        const currentAreaHistory = history.filter((item) => item.areaType === input.area);
        const nextVersion = (currentAreaHistory[0]?.version || 0) + 1;

        const rendering = await generateRendering({
          styleTheme,
          colorScheme,
          area: input.area,
          machineCount: cadParameters.machineCount,
          roomCount: cadParameters.roomCount,
          totalArea: cadParameters.totalArea,
          rgbDensity: cadParameters.rgbDensity,
        });

        const savedRendering = await persistGeneratedRendering({
          designId: input.designId,
          area: input.area,
          version: nextVersion,
          rendering,
        });

        return {
          success: true,
          fallbackCount: rendering.isFallback ? 1 : 0,
          warningMessage: rendering.fallbackReason || null,
          rendering: savedRendering,
        };
      } catch (error) {
        console.error("Failed to regenerate area rendering:", error);
        throw new Error("单张效果图重新生成失败，请稍后重试");
      }
    }),
});
