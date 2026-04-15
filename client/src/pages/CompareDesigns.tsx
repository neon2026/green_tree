import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CompareDesigns() {
  const [, setLocation] = useLocation();
  const [projectIds, setProjectIds] = useState<number[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从URL获取项目ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectsParam = params.get("projects");
    if (projectsParam) {
      const ids = projectsParam.split(",").map((id) => parseInt(id, 10));
      setProjectIds(ids);
    }
  }, []);

  // 获取设计方案
  useEffect(() => {
    if (projectIds.length === 0) return;

    const fetchDesigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 这里应该调用API获取多个项目的设计方案
        // 目前使用示例数据演示
        const mockDesigns = projectIds.map((projectId) => ({
          projectId,
          designs: [
            {
              id: projectId * 100 + 1,
              name: `赛博朋克风格 - 项目${projectId}`,
              style: "cyberpunk",
              budget: "premium",
              rgbDensity: "high",
              machineCount: 48,
              totalArea: 2500,
            },
            {
              id: projectId * 100 + 2,
              name: `未来科技风格 - 项目${projectId}`,
              style: "futuristic",
              budget: "standard",
              rgbDensity: "medium",
              machineCount: 48,
              totalArea: 2500,
            },
            {
              id: projectId * 100 + 3,
              name: `暗黑竞技风格 - 项目${projectId}`,
              style: "dark_gaming",
              budget: "economy",
              rgbDensity: "low",
              machineCount: 48,
              totalArea: 2500,
            },
          ],
        }));

        setDesigns(mockDesigns);
      } catch (err) {
        setError("无法加载设计方案");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, [projectIds]);

  if (projectIds.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">参数错误</h2>
          </div>
          <p className="text-slate-300 mb-6">需要至少选择2个项目才能进行对比。</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">方案对比</h1>
              <p className="text-slate-400 mt-1">对比 {projectIds.length} 个项目的设计方案</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-red-200 font-semibold">加载失败</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Comparison Table */}
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/50">
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">对比项目</th>
                      {designs.map((project) => (
                        <th key={project.projectId} className="px-6 py-4 text-left text-emerald-400 font-semibold">
                          项目 {project.projectId}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 风格对比 */}
                    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">推荐风格</td>
                      {designs.map((project) => (
                        <td key={project.projectId} className="px-6 py-4 text-slate-200">
                          {project.designs[0]?.name || "-"}
                        </td>
                      ))}
                    </tr>

                    {/* 机位数对比 */}
                    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">机位数</td>
                      {designs.map((project) => (
                        <td key={project.projectId} className="px-6 py-4 text-slate-200">
                          {project.designs[0]?.machineCount || "-"} 个
                        </td>
                      ))}
                    </tr>

                    {/* 总面积对比 */}
                    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">总面积</td>
                      {designs.map((project) => (
                        <td key={project.projectId} className="px-6 py-4 text-slate-200">
                          {project.designs[0]?.totalArea || "-"} ㎡
                        </td>
                      ))}
                    </tr>

                    {/* 预算等级对比 */}
                    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">预算等级</td>
                      {designs.map((project) => (
                        <td key={project.projectId} className="px-6 py-4 text-slate-200">
                          {project.designs[0]?.budget === "premium" && "高端"}
                          {project.designs[0]?.budget === "standard" && "标准"}
                          {project.designs[0]?.budget === "economy" && "经济"}
                        </td>
                      ))}
                    </tr>

                    {/* RGB灯光密度对比 */}
                    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">RGB灯光密度</td>
                      {designs.map((project) => (
                        <td key={project.projectId} className="px-6 py-4 text-slate-200">
                          {project.designs[0]?.rgbDensity === "high" && "高"}
                          {project.designs[0]?.rgbDensity === "medium" && "中"}
                          {project.designs[0]?.rgbDensity === "low" && "低"}
                        </td>
                      ))}
                    </tr>


                  </tbody>
                </table>
              </div>
            </Card>

            {/* Detailed Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {designs.map((project) => (
                <Card key={project.projectId} className="bg-slate-800 border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">项目 {project.projectId} 的方案</h3>

                  <div className="space-y-4">
                    {project.designs.map((design: any) => (
                      <div key={design.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <h4 className="text-emerald-400 font-semibold mb-3">{design.name}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                          <div>
                            <span className="text-slate-400">风格：</span>
                            {design.style === "cyberpunk" && "赛博朋克"}
                            {design.style === "futuristic" && "未来科技"}
                            {design.style === "dark_gaming" && "暗黑竞技"}
                          </div>
                          <div>
                            <span className="text-slate-400">预算：</span>
                            {design.budget === "premium" && "高端"}
                            {design.budget === "standard" && "标准"}
                            {design.budget === "economy" && "经济"}
                          </div>
                          <div>
                            <span className="text-slate-400">RGB密度：</span>
                            {design.rgbDensity === "high" && "高"}
                            {design.rgbDensity === "medium" && "中"}
                            {design.rgbDensity === "low" && "低"}
                          </div>
                          <div>
                            <span className="text-slate-400">造价：</span>
                            <span className="text-emerald-400">¥{(design.estimatedPrice / 10000).toFixed(1)}万</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
