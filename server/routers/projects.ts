import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createProject,
  getProjectById,
  getUserProjects,
  updateProject,
  deleteProject,
  createDesign,
  getProjectDesigns,
  getDesignById,
  updateDesign,
} from "../db-helpers";
import {
  generateDesigns,
  getAvailableStyles,
  getRenderingThemeForStyle,
  getStyleDetails,
} from "../services/designGenerator";
import { parseCADFile, validateCADParameters } from "../services/cadParser";

export const projectsRouter = router({
  /**
   * 创建新项目
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "项目名称不能为空"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createProject({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        status: "draft",
      });

      return {
        success: true,
        projectId: result[0],
      };
    }),

  /**
   * 获取用户的所有项目
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const projects = await getUserProjects(ctx.user.id);
    return projects;
  }),

  /**
   * 获取项目详情
   */
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const project = await getProjectById(input.projectId);
      if (!project) {
        throw new Error("项目不存在");
      }
      return project;
    }),

  /**
   * 上传CAD文件并解析参数
   */
  uploadCAD: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        cadFileUrl: z.string(),
        cadFileKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 解析CAD文件
        // 从 cadFileKey 中提取文件名
        const fileName = input.cadFileKey.split('/').pop() || 'file';
        const cadParameters = await parseCADFile(input.cadFileUrl, fileName);

        // 验证参数
        const validation = validateCADParameters(cadParameters);
        if (!validation.valid) {
          throw new Error(`CAD参数验证失败: ${validation.errors.join(", ")}`);
        }

        // 更新项目
        await updateProject(input.projectId, {
          cadFileUrl: input.cadFileUrl,
          cadFileKey: input.cadFileKey,
          cadParameters: JSON.stringify(cadParameters),
        });

        return {
          success: true,
          cadParameters,
        };
      } catch (error) {
        throw new Error(`CAD文件解析失败: ${error instanceof Error ? error.message : "未知错误"}`);
      }
    }),

  /**
   * 更新CAD参数（手动调整）
   */
  updateCADParameters: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        cadParameters: z.object({
          totalArea: z.number().positive(),
          machineCount: z.number().positive(),
          privateRoomCount: z.number().nonnegative(),
          barArea: z.number().nonnegative(),
          hallArea: z.number().nonnegative(),
          vipArea: z.number().nonnegative(),
          coreAreas: z.array(z.string()),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // 验证参数
      const validation = validateCADParameters(input.cadParameters);
      if (!validation.valid) {
        throw new Error(`参数验证失败: ${validation.errors.join(", ")}`);
      }

      // 更新项目
      await updateProject(input.projectId, {
        cadParameters: JSON.stringify(input.cadParameters),
      });

      return {
        success: true,
        cadParameters: input.cadParameters,
      };
    }),

  /**
   * 删除项目
   */
  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProject(input.projectId);
      return { success: true };
    }),
});

export const designsRouter = router({
  /**
   * 获取设计风格列表
   */
  getStyles: protectedProcedure.query(async () => {
    return getAvailableStyles();
  }),

  /**
   * 生成设计方案
   */
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        budgetRange: z.enum(["economy", "standard", "premium"]),
        rgbDensity: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ input }) => {
      // 获取项目信息
      const project = await getProjectById(input.projectId);
      if (!project) {
        throw new Error("项目不存在");
      }

      if (!project.cadParameters) {
        throw new Error("项目未上传CAD文件");
      }

      const cadParameters = JSON.parse(project.cadParameters);

      // 生成设计方案
      const designs = generateDesigns({
        cadParameters,
        budgetRange: input.budgetRange,
        rgbDensity: input.rgbDensity,
      });

      // 保存设计方案到数据库
      const savedDesigns = [];
      for (const design of designs) {
        const result = await createDesign({
          projectId: input.projectId,
          styleTheme: design.styleId,
          colorScheme: design.parameters.colorScheme,
          budgetRange: input.budgetRange,
          parameters: JSON.stringify(design.parameters),
          status: "draft",
        });

        savedDesigns.push({
          ...design,
          databaseId: result[0],
          renderingTheme: getRenderingThemeForStyle(design.styleId),
        });
      }

      return {
        success: true,
        designs: savedDesigns,
      };
    }),

  /**
   * 获取项目的所有设计方案
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const designs = await getProjectDesigns(input.projectId);
      return designs.map((design) => {
        const storedStyleId = design.styleTheme || "party_k";
        const styleDetails = getStyleDetails(storedStyleId);
        return {
          ...design,
          styleId: storedStyleId,
          styleTheme: styleDetails?.name || storedStyleId,
          renderingTheme: getRenderingThemeForStyle(storedStyleId),
        };
      });
    }),

  /**
   * 获取设计方案详情
   */
  get: protectedProcedure
    .input(z.object({ designId: z.number() }))
    .query(async ({ input }) => {
      const design = await getDesignById(input.designId);
      if (!design) {
        throw new Error("设计方案不存在");
      }
      const storedStyleId = design.styleTheme || "party_k";
      const styleDetails = getStyleDetails(storedStyleId);
      return {
        ...design,
        styleId: storedStyleId,
        styleTheme: styleDetails?.name || storedStyleId,
      };
    }),

  /**
   * 更新设计方案
   */
  update: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
        data: z.object({
          styleTheme: z.string().optional(),
          colorScheme: z.string().optional(),
          budgetRange: z.string().optional(),
          parameters: z.string().optional(),
          status: z.enum(["draft", "completed"]).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await updateDesign(input.designId, input.data);
      return { success: true };
    }),
});


