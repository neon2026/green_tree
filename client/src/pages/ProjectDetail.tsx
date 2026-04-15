import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string; size: number; url: string} | null>(null);

  // 安全地解析projectId，处理无效值
  const projectIdNum = projectId ? parseInt(projectId, 10) : 0;
  const isValidProjectId = !isNaN(projectIdNum) && projectIdNum > 0;

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { projectId: projectIdNum },
    { enabled: isValidProjectId }
  );

  const uploadCADMutation = trpc.projects.uploadCAD.useMutation({
    onSuccess: (data: any) => {
      if (cadFile) {
        setUploadedFile({
          name: cadFile.name,
          size: cadFile.size,
          url: data.cadFileUrl || "",
        });
      }
      setCadFile(null);
      setIsUploading(false);
    },
  });

  const handleCADUpload = async () => {
    if (!cadFile || !isValidProjectId) return;

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

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">项目不存在</h2>
          </div>
          <p className="text-slate-300 mb-6">
            无法找到指定的项目。该项目可能已被删除。
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-400 mt-1">{project.description}</p>
            </div>
            <Button
              onClick={() => setLocation("/dashboard")}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CAD Upload Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">上传平面图</h2>

              <div className="space-y-6">
                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("cad-file-input")?.click()}
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">点击选择平面图文件</p>
                  <p className="text-slate-400 text-sm">支持 DWG、DXF、JPG、PNG 格式，最大 50MB</p>

                  <input
                    id="cad-file-input"
                    type="file"
                    accept=".dwg,.dxf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const maxSize = 50 * 1024 * 1024; // 50MB
                        if (file.size > maxSize) {
                          alert(`文件过大！最大支持 50MB，您选择的文件大小为 ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                          return;
                        }
                        setCadFile(file);
                      }
                    }}
                  />
                </div>

                {/* Selected File Info */}
                {cadFile && (
                  <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-white font-medium">{cadFile.name}</p>
                        <p className="text-slate-400 text-sm">
                          {(cadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setCadFile(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                )}

                {/* Format Info */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text">CAD格式</span>: DWG、DXF 文件将自动解析平面图参数
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    <span className="font-semibold">图片格式</span>: JPG、PNG 图片将使用OCR技术识别平面图信息
                  </p>
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleCADUpload}
                  disabled={!cadFile || isUploading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    "上传并解析平面图"
                  )}
                </Button>

                {/* Uploaded File Display */}
                {uploadedFile && (
                  <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-emerald-200 font-semibold text-sm mb-1">平面图已上传</p>
                          <p className="text-emerald-100 text-sm truncate">{uploadedFile.name}</p>
                          <p className="text-emerald-300/70 text-xs mt-1">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30"
                          onClick={() => {
                            if (uploadedFile.url) {
                              window.open(uploadedFile.url, '_blank');
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-300 hover:text-red-400 hover:bg-red-900/20"
                          onClick={() => setUploadedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Project Info Section */}
          <div>
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">项目信息</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">项目ID</p>
                  <p className="text-white font-medium">{project.id}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">状态</p>
                  <p className="text-emerald-400 font-medium capitalize">{project.status}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">创建时间</p>
                  <p className="text-slate-300 text-sm">
                    {new Date(project.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">最后更新</p>
                  <p className="text-slate-300 text-sm">
                    {new Date(project.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => setLocation(`/projects/${projectIdNum}/designs`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  生成设计方案
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
