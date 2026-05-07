export type BatchRenderingResult = {
  designId: number;
  fallbackCount: number;
};

export type BatchRenderingSummary = {
  completedDesignCount: number;
  fallbackImageCount: number;
};

export async function runBatchRenderingGeneration(
  designIds: number[],
  generateRendering: (designId: number) => Promise<{ fallbackCount?: number }>,
): Promise<BatchRenderingSummary> {
  let completedDesignCount = 0;
  let fallbackImageCount = 0;

  for (const designId of designIds) {
    const result = await generateRendering(designId);
    completedDesignCount += 1;
    fallbackImageCount += result.fallbackCount || 0;
  }

  return {
    completedDesignCount,
    fallbackImageCount,
  };
}

export function buildBatchRenderingToastMessage(summary: BatchRenderingSummary): {
  level: "success" | "warning";
  message: string;
} {
  if (summary.fallbackImageCount > 0) {
    return {
      level: "warning",
      message: `已为 ${summary.completedDesignCount} 套方案触发效果图生成，其中 ${summary.fallbackImageCount} 张暂以占位图展示；图像服务恢复后可进入详情页重生成。`,
    };
  }

  return {
    level: "success",
    message: `已为 ${summary.completedDesignCount} 套方案触发效果图生成，可继续进入详情页查看结果。`,
  };
}
