import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generateMaterialsList, generateBudgetReport } from "../services/budgetCalculator";
import { getDesignById } from "../db-helpers";

export const budgetRouter = router({
  /**
   * 计算设计方案的预算估算
   */
  calculate: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      const params = JSON.parse(design.parameters || "{}");
      const budgetLevel = design.budgetRange as "economy" | "standard" | "premium";

      const estimate = generateMaterialsList(
        params.totalArea,
        params.machineCount,
        params.privateRoomCount,
        budgetLevel
      );

      return {
        estimate,
        report: generateBudgetReport(estimate),
      };
    }),

  /**
   * 获取材料清单
   */
  getMaterials: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      const params = JSON.parse(design.parameters || "{}");
      const budgetLevel = design.budgetRange as "economy" | "standard" | "premium";

      const estimate = generateMaterialsList(
        params.totalArea,
        params.machineCount,
        params.privateRoomCount,
        budgetLevel
      );

      return estimate.materials;
    }),

  /**
   * 生成造价报表
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      const params = JSON.parse(design.parameters || "{}");
      const budgetLevel = design.budgetRange as "economy" | "standard" | "premium";

      const estimate = generateMaterialsList(
        params.totalArea,
        params.machineCount,
        params.privateRoomCount,
        budgetLevel
      );

      return generateBudgetReport(estimate);
    }),
});
