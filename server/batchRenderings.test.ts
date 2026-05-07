import { describe, expect, it, vi } from "vitest";
import {
  buildBatchRenderingToastMessage,
  runBatchRenderingGeneration,
} from "../client/src/lib/batchRenderings";

describe("batch renderings helpers", () => {
  it("runs all design ids sequentially and sums fallback counts", async () => {
    const callOrder: number[] = [];
    const generateRendering = vi.fn(async (designId: number) => {
      callOrder.push(designId);
      return {
        fallbackCount: designId === 2 ? 3 : 1,
      };
    });

    const summary = await runBatchRenderingGeneration([1, 2, 3], generateRendering);

    expect(callOrder).toEqual([1, 2, 3]);
    expect(generateRendering).toHaveBeenCalledTimes(3);
    expect(summary).toEqual({
      completedDesignCount: 3,
      fallbackImageCount: 5,
    });
  });

  it("builds a warning message when fallback images are present", () => {
    expect(
      buildBatchRenderingToastMessage({
        completedDesignCount: 7,
        fallbackImageCount: 4,
      }),
    ).toEqual({
      level: "warning",
      message:
        "已为 7 套方案触发效果图生成，其中 4 张暂以占位图展示；图像服务恢复后可进入详情页重生成。",
    });
  });

  it("builds a success message when all renderings complete without fallback", () => {
    expect(
      buildBatchRenderingToastMessage({
        completedDesignCount: 7,
        fallbackImageCount: 0,
      }),
    ).toEqual({
      level: "success",
      message: "已为 7 套方案触发效果图生成，可继续进入详情页查看结果。",
    });
  });
});
