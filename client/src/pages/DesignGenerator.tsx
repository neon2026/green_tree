import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Check, AlertCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { trpc } from "@/lib/trpc";
import { buildBatchRenderingToastMessage, runBatchRenderingGeneration } from "@/lib/batchRenderings";

type BudgetRange = "economy" | "standard" | "premium";
type RGBDensity = "low" | "medium" | "high";

const BUDGET_RANGES: { value: BudgetRange; label: string; description: string }[] = [
  { value: "economy", label: "经济版", description: "成本控制，基础配置" },
  { value: "standard", label: "标准版", description: "性价比最优，推荐选择" },
  { value: "premium", label: "高端版", description: "顶级材料，豪华配置" },
];

const RGB_DENSITIES: { value: RGBDensity; label: string; description: string }[] = [
  { value: "low", label: "低密度", description: "简约灯光，节能环保" },
  { value: "medium", label: "中密度", description: "均衡搭配，视觉舒适" },
  { value: "high", label: "高密度", description: "炫彩灯带，视觉冲击" },
];

export default function DesignGenerator() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();

  // 安全地解析projectId
  const projectIdNum = projectId ? parseInt(projectId, 10) : 0;
  const isValidProjectId = !isNaN(projectIdNum) && projectIdNum > 0;

  // UI State
  const [step, setStep] = useState<"config" | "generating" | "results">("config");
  const [budgetRange, setBudgetRange] = useState<BudgetRange>("standard");
  const [rgbDensity, setRGBDensity] = useState<RGBDensity>("medium");
  const [isBatchRendering, setIsBatchRendering] = useState(false);

  // API Calls
  const { data: project } = trpc.projects.get.useQuery(
    { projectId: projectIdNum },
    { enabled: isValidProjectId }
  );

  // 如果projectId无效，显示错误页面
  if (!isValidProjectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">无效的项目ID</h2>
          </div>
          <p className="text-slate-300 mb-6">
            无法加载项目详情。请返回项目列表重新选择。
          </p>
          <Button
            onClick={() => setLocation("/dashboard")}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            返回项目列表
          </Button>
        </Card>
      </div>
    );
  }

  const generateMutation = trpc.designs.generate.useMutation({
    onSuccess: () => {
      setStep("results");
    },
  });
  const generateRenderingMutation = trpc.renderings.generate.useMutation();
   const handleGenerate = () => {
    setStep("generating");
    generateMutation.mutate({
      projectId: projectIdNum,
      budgetRange,
      rgbDensity,
    });
  };

  const handleBatchGenerateRenderings = async () => {
    const designs = generateMutation.data?.designs || [];
    if (designs.length === 0) {
      sonnerToast.error("请先生成设计方案，再批量生成效果图。");
      return;
    }

    setIsBatchRendering(true);

    try {
      const summary = await runBatchRenderingGeneration(
        designs.map((design) => design.databaseId),
        async (designId) => generateRenderingMutation.mutateAsync({ designId }),
      );
      const toastPayload = buildBatchRenderingToastMessage(summary);

      if (toastPayload.level === "warning") {
        sonnerToast.warning(toastPayload.message);
      } else {
        sonnerToast.success(toastPayload.message);
      }
    } catch (error) {
      console.error("Batch rendering generation failed", error);
      sonnerToast.error("批量生成效果图失败，请稍后重试。");
    } finally {
      setIsBatchRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">生成设计方案</h1>
              <p className="text-slate-400 mt-1">{project?.name}</p>
            </div>
            <Button
              onClick={() => setLocation(`/projects/${projectIdNum}`)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← 返回
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {step === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-8">配置设计参数</h2>



                {/* Budget Range Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">预算等级</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BUDGET_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setBudgetRange(range.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          budgetRange === range.value
                            ? "border-emerald-500 bg-slate-700"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <p className="font-semibold text-white">{range.label}</p>
                        <p className="text-sm text-slate-400">{range.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RGB Density Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">RGB灯光密度</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {RGB_DENSITIES.map((density) => (
                      <button
                        key={density.value}
                        onClick={() => setRGBDensity(density.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          rgbDensity === density.value
                            ? "border-emerald-500 bg-slate-700"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <p className="font-semibold text-white">{density.label}</p>
                        <p className="text-sm text-slate-400">{density.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 py-6 text-lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      生成 7 种设计方案
                    </>
                  )}
                </Button>
              </Card>
            </div>

            {/* Summary Panel */}
            <div>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">配置摘要</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">预算等级</p>
                    <p className="text-white font-medium">
                      {BUDGET_RANGES.find((b) => b.value === budgetRange)?.label}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">灯光密度</p>
                    <p className="text-white font-medium">
                      {RGB_DENSITIES.find((d) => d.value === rgbDensity)?.label}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-300">
                    系统将为您生成当前支持的 7 种设计方案风格；每种方案都会保留独立的渲染主题映射，便于后续进入详情页继续生成对应效果图。
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">正在生成设计方案...</h2>
            <p className="text-slate-400">这可能需要30-60秒，请耐心等待</p>
          </div>
        )}

        {step === "results" && generateMutation.data && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">生成完成！</h2>
            <Card className="mb-6 border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-300" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-amber-100">已生成 7 套风格方案，并完成对应渲染主题映射。</p>
                  <p className="text-amber-200/90">
                    当前可逐个进入方案详情页生成对应效果图；若内置图像服务出现额度受限，系统会先展示占位图并保留后续重生成入口。
                  </p>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {(generateMutation.data.designs || []).map((design: any) => (
                <Card
                  key={design.databaseId}
                  className="bg-slate-800 border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer group"
                  onClick={() => setLocation(`/projects/${projectIdNum}/design/${design.databaseId}`)}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                      {design.styleName}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">{design.theme || design.styleId}</p>
                    <div className="mb-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                        渲染主题：{design.renderingTheme || design.styleId}
                      </span>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-slate-300">可继续生成对应效果图</span>
                    </div>
                    <div className="space-y-2 mb-4">

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">颜色主题</span>
                        <span className="text-white">{design.parameters?.colorScheme || design.colorScheme || "未设置"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">预算等级</span>
                        <span className="text-white">{design.budgetRange || budgetRange}</span>
                      </div>

                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setLocation(`/projects/${projectIdNum}/design/${design.databaseId}`);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Button
                onClick={() => setStep("config")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                重新配置
              </Button>
              <Button
                onClick={handleBatchGenerateRenderings}
                disabled={isBatchRendering || generateRenderingMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isBatchRendering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    批量生成效果图中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    批量生成 7 套效果图
                  </>
                )}
              </Button>
              <Button
                onClick={() => setLocation(`/projects/${projectIdNum}`)}
                className="bg-slate-700 text-white hover:bg-slate-600"
              >
                返回项目
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
