import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateDesignRenderings,
  generateRendering,
  type RenderingAreaType,
} from "../services/renderingGenerator";
import {
  createRendering,
  getDesignById,
  getLatestRenderingsByArea,
  getRenderingHistory,
} from "../db-helpers";

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

function normalizeRendering(record: {
  id?: number;
  areaType?: string | null;
  imageUrl?: string | null;
  version?: number | null;
  createdAt?: Date | null;
}) {
  const area = (record.areaType || "entrance") as RenderingAreaType;
  return {
    id: record.id ?? 0,
    area,
    label: areaLabels[area] || area,
    url: record.imageUrl || "",
    version: record.version ?? 1,
    createdAt: record.createdAt?.toISOString?.() ?? null,
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

          const result = await createRendering({
            designId: input.designId,
            imageUrl: rendering.url,
            imageKey: `design_${input.designId}_${rendering.area}_v${nextVersion}`,
            areaType: rendering.area,
            version: nextVersion,
          });

          savedRenderings.push({
            id: (result as any).insertId || 0,
            area: rendering.area,
            label: rendering.label,
            url: rendering.url,
            prompt: rendering.prompt,
            version: nextVersion,
          });
        }

        return {
          success: true,
          renderings: savedRenderings,
        };
      } catch (error) {
        console.error("Failed to generate renderings:", error);
        throw new Error("效果图生成失败，请稍后重试");
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
        const [latestRenderings, history] = await Promise.all([
          getLatestRenderingsByArea(input.designId),
          getRenderingHistory(input.designId),
        ]);

        return {
          renderings: latestRenderings.map(normalizeRendering),
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

        const result = await createRendering({
          designId: input.designId,
          imageUrl: rendering.url,
          imageKey: `design_${input.designId}_${input.area}_v${nextVersion}`,
          areaType: input.area,
          version: nextVersion,
        });

        return {
          success: true,
          rendering: {
            id: (result as any).insertId || 0,
            area: input.area,
            label: areaLabels[input.area],
            url: rendering.url,
            prompt: rendering.prompt,
            version: nextVersion,
          },
        };
      } catch (error) {
        console.error("Failed to regenerate area rendering:", error);
        throw new Error("单张效果图重新生成失败，请稍后重试");
      }
    }),
});
