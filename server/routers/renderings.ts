import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generateDesignRenderings } from "../services/renderingGenerator";
import { getDesignById } from "../db-helpers";
import { createRendering } from "../db-helpers";

export const renderingsRouter = router({
  /**
   * 为设计方案生成效果图
   */
  generate: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // 获取设计方案信息
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      try {
        const parameters = JSON.parse(design.parameters || "{}");
        const cadParameters = parameters.cadParameters || {
          totalArea: 500,
          machineCount: 20,
          roomCount: 5,
        };
        
        const styleTheme = design.styleTheme || "cyberpunk";
        const colorScheme = design.colorScheme || "blue";

        // 生成所有区域的效果图
        const renderings = await generateDesignRenderings(
          input.designId,
          styleTheme,
          colorScheme,
          cadParameters,
          parameters.rgbDensity || "medium"
        );

        // 保存效果图到数据库
        const savedRenderings = [];
        for (const rendering of renderings) {
          const result = await createRendering({
            designId: input.designId,
            imageUrl: rendering.url,
            imageKey: `design_${input.designId}_${rendering.area}`,
            areaType: rendering.area,
          });
          savedRenderings.push({
            ...rendering,
            databaseId: (result as any).insertId || 0,
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

  /**
   * 获取设计方案的所有效果图
   */
  list: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: 从数据库查询renderings表
        // const db = await getDb();
        // const renderings = await db.select().from(renderings).where(eq(renderings.designId, input.designId));
        // return { renderings };
        
        // 临时返回空数组，待数据库集成
        return {
          renderings: [],
          message: "效果图列表功能开发中",
        };
      } catch (error) {
        console.error("Failed to list renderings:", error);
        throw new Error("获取效果图列表失败");
      }
    }),
});
