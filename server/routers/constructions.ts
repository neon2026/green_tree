import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDesignById } from "../db-helpers";
import { getDesignConstruction } from "../db-helpers";

export const constructionsRouter = router({
  getByDesign: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }

      const construction = await getDesignConstruction(input.designId);
      return {
        designId: input.designId,
        hasDwg: Boolean(construction?.dwgFileUrl),
        hasPdf: Boolean(construction?.pdfFileUrl),
        dwgFileUrl: construction?.dwgFileUrl ?? null,
        pdfFileUrl: construction?.pdfFileUrl ?? null,
        version: construction?.version ?? null,
        createdAt: construction?.createdAt?.toISOString?.() ?? null,
      };
    }),
});
