import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

type ColorTheme = "blue" | "purple" | "green" | "red" | "multicolor";
type BudgetRange = "economy" | "standard" | "premium";
type RGBDensity = "low" | "medium" | "high";

const COLOR_THEMES: { value: ColorTheme; label: string; description: string }[] = [
  { value: "blue", label: "蓝色系", description: "冷静、科技感" },
  { value: "purple", label: "紫色系", description: "神秘、高端" },
  { value: "green", label: "绿色系", description: "活力、专业" },
  { value: "red", label: "红色系", description: "热烈、竞技" },
  { value: "multicolor", label: "多彩", description: "炫彩、社交" },
];

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
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue");
  const [budgetRange, setBudgetRange] = useState<BudgetRange>("standard");
  const [rgbDensity, setRGBDensity] = useState<RGBDensity>("medium");

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
    onSuccess: (data) => {
      setStep("results");
    },
  });

  const handleGenerate = () => {
    setStep("generating");
    generateMutation.mutate({
      projectId: projectIdNum,
      colorTheme,
      budgetRange,
      rgbDensity,
    });
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

                {/* Color Theme Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">颜色主题</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setColorTheme(theme.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          colorTheme === theme.value
                            ? "border-emerald-500 bg-slate-700"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <p className="font-semibold text-white">{theme.label}</p>
                        <p className="text-sm text-slate-400">{theme.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

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
                      生成5-10种设计方案
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
                    <p className="text-xs text-slate-400 uppercase tracking-wider">颜色主题</p>
                    <p className="text-white font-medium">
                      {COLOR_THEMES.find((t) => t.value === colorTheme)?.label}
                    </p>
                  </div>

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
                    系统将为您生成5-10种不同风格的设计方案，每种方案都包含效果图、参数和造价估算。
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
            <h2 className="text-2xl font-bold text-white mb-8">生成完成！</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(generateMutation.data.designs || []).map((design: any) => (
                <Card
                  key={design.id}
                  className="bg-slate-800 border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer group"
                  onClick={() => setLocation(`/projects/${projectIdNum}/design/${design.id}`)}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                      {design.styleName}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">{design.styleId}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">颜色主题</span>
                        <span className="text-white">{design.colorTheme}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">预算等级</span>
                        <span className="text-white">{design.budgetRange}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">造价估算</span>
                        <span className="text-emerald-400 font-semibold">
                          ¥{design.estimatedBudget?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setLocation(`/projects/${projectIdNum}/design/${design.id}`);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                onClick={() => setStep("config")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                重新配置
              </Button>
              <Button
                onClick={() => setLocation(`/projects/${projectIdNum}`)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
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
