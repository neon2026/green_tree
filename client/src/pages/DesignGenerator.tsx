import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Check } from "lucide-react";
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

  const projectIdNum = parseInt(projectId || "0");

  // UI State
  const [step, setStep] = useState<"config" | "generating" | "results">("config");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue");
  const [budgetRange, setBudgetRange] = useState<BudgetRange>("standard");
  const [rgbDensity, setRGBDensity] = useState<RGBDensity>("medium");

  // API Calls
  const { data: project } = trpc.projects.get.useQuery(
    { projectId: projectIdNum },
    { enabled: !!projectId }
  );

  const generateMutation = trpc.designs.generate.useMutation({
    onSuccess: () => {
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation(`/projects/${projectIdNum}`)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← 返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">生成设计方案</h1>
              <p className="text-slate-400 mt-1">{project.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {step === "config" && (
          <div className="space-y-8">
            {/* Color Theme Selection */}
            <Card className="bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">选择颜色主题</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setColorTheme(theme.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      colorTheme === theme.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{theme.label}</div>
                    <div className="text-xs text-slate-400">{theme.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Budget Range Selection */}
            <Card className="bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">选择预算区间</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BUDGET_RANGES.map((budget) => (
                  <button
                    key={budget.value}
                    onClick={() => setBudgetRange(budget.value)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      budgetRange === budget.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-semibold text-white mb-2">{budget.label}</div>
                    <div className="text-sm text-slate-400">{budget.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* RGB Density Selection */}
            <Card className="bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">RGB灯带密度</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RGB_DENSITIES.map((density) => (
                  <button
                    key={density.value}
                    onClick={() => setRGBDensity(density.value)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      rgbDensity === density.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-semibold text-white mb-2">{density.label}</div>
                    <div className="text-sm text-slate-400">{density.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Generate Button */}
            <div className="flex gap-4">
              <Button
                onClick={() => setLocation(`/projects/${projectIdNum}`)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                取消
              </Button>
              <Button
                onClick={handleGenerate}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                生成5-10种方案
              </Button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-8">
              <Loader2 className="w-16 h-16 animate-spin text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">正在生成设计方案...</h2>
            <p className="text-slate-400">这可能需要30-60秒，请稍候</p>
          </div>
        )}

        {step === "results" && generateMutation.data && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
              <Check className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-emerald-300 font-semibold">
                  成功生成 {generateMutation.data.designs.length} 个设计方案
                </h3>
                <p className="text-emerald-200 text-sm">您可以选择其中一个方案进行进一步修改和优化</p>
              </div>
            </div>

            {/* Design Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generateMutation.data.designs.map((design, index) => (
                <Card
                  key={design.id}
                  className="bg-slate-800 border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {design.styleName}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{design.styleId}</p>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">#{index + 1}</div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="bg-slate-700 rounded p-3">
                        <p className="text-xs text-slate-400">颜色方案</p>
                        <p className="text-white font-semibold">{design.parameters.colorScheme}</p>
                      </div>

                      <div className="bg-slate-700 rounded p-3">
                        <p className="text-xs text-slate-400">预算估算</p>
                        <p className="text-emerald-400 font-bold">¥{design.estimatedBudget.toLocaleString()}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setLocation(`/projects/${projectIdNum}/design/${design.id}`)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      查看详情 →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setStep("config")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                重新生成
              </Button>
              <Button
                onClick={() => setLocation(`/projects/${projectIdNum}`)}
                className="flex-1 bg-slate-700 hover:bg-slate-600"
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
