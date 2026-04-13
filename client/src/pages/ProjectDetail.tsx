import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const projectIdNum = parseInt(projectId || "0");

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { projectId: projectIdNum },
    { enabled: !!projectId }
  );

  const uploadCADMutation = trpc.projects.uploadCAD.useMutation({
    onSuccess: () => {
      setCadFile(null);
      setIsUploading(false);
    },
  });

  const handleCADUpload = async () => {
    if (!cadFile) return;

    setIsUploading(true);
    // TODO: 实现实际的文件上传逻辑
    // 这里需要调用S3上传或其他文件存储服务
    const cadFileUrl = "https://example.com/cad-file.dxf";
    const cadFileKey = `projects/${projectIdNum}/cad-${Date.now()}.dxf`;

    uploadCADMutation.mutate({
      projectId: projectIdNum,
      cadFileUrl,
      cadFileKey,
    });
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h3 className="text-red-200 font-semibold">项目不存在</h3>
          </div>
        </div>
      </div>
    );
  }

  const cadParams = project.cadParameters ? JSON.parse(project.cadParameters) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← 返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-400 mt-1">项目状态: {project.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CAD Upload Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">上传CAD平面图</h2>

              <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-emerald-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-semibold mb-2">拖拽文件到此或点击选择</p>
                <p className="text-slate-400 text-sm mb-6">支持格式: .dwg, .dxf | 最大文件: 50MB</p>

                <input
                  type="file"
                  id="cad-upload"
                  accept=".dwg,.dxf"
                  onChange={(e) => setCadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <Button
                  onClick={() => document.getElementById("cad-upload")?.click()}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  选择文件
                </Button>
              </div>

              {cadFile && (
                <div className="mt-6 p-4 bg-slate-700 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{cadFile.name}</p>
                    <p className="text-slate-400 text-sm">{(cadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    onClick={handleCADUpload}
                    disabled={isUploading || uploadCADMutation.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {isUploading || uploadCADMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      "上传并分析"
                    )}
                  </Button>
                </div>
              )}

              {uploadCADMutation.error && (
                <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200">{uploadCADMutation.error.message}</p>
                </div>
              )}
            </Card>
          </div>

          {/* CAD Parameters Section */}
          <div>
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6">空间参数</h3>

              {cadParams ? (
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">总建筑面积</p>
                    <p className="text-2xl font-bold text-emerald-400">{cadParams.totalArea} ㎡</p>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">机位数量</p>
                    <p className="text-2xl font-bold text-emerald-400">{cadParams.machineCount} 个</p>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">包间数量</p>
                    <p className="text-2xl font-bold text-emerald-400">{cadParams.privateRoomCount} 个</p>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">核心区域</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cadParams.coreAreas.map((area: string) => (
                        <span
                          key={area}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setLocation(`/projects/${projectIdNum}/designs`)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 mt-6"
                  >
                    生成设计方案 →
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">等待CAD文件上传...</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
