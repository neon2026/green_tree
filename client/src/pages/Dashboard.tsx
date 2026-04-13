import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");

  const { data: projects, isLoading, error } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (data: any) => {
      setProjectName("");
      setIsCreating(false);
      // 跳转到项目详情页
      if (data && data.projectId) {
        setLocation(`/projects/${data.projectId}`);
      }
    },
  });

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    createProjectMutation.mutate({
      name: projectName,
      description: "",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">绿树电竞AI设计平台</h1>
          <p className="text-slate-300 mb-8">智能室内设计，一站式交付</p>
          <Button size="lg" onClick={() => setLocation("/login")}>
            登录开始
          </Button>
        </div>
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
              <h1 className="text-3xl font-bold text-white">我的项目</h1>
              <p className="text-slate-400 mt-1">欢迎回来，{user?.name}</p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              新建项目
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Create Project Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">创建新项目</h2>

              <input
                type="text"
                placeholder="输入项目名称"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProject();
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setProjectName("");
                  }}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || createProjectMutation.isPending}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    "创建"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-200 font-semibold">加载失败</h3>
              <p className="text-red-300 text-sm mt-1">无法加载项目列表，请稍后重试</p>
            </div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card
                key={project.id}
                className="bg-slate-800 border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer group"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                      {project.status === "draft" && "草稿"}
                      {project.status === "completed" && "已完成"}
                      {project.status === "archived" && "已归档"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setLocation(`/projects/${project.id}`);
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </div>
              </Card>
            ))}  
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-slate-300 mb-2">还没有项目</h3>
            <p className="text-slate-400 mb-8">点击"新建项目"开始创建您的第一个设计方案</p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              创建项目
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
