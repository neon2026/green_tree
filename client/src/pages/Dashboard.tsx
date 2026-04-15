import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, AlertCircle, Trash2, GitCompare } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const utils = trpc.useUtils();

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (data: any) => {
      setProjectName("");
      setIsCreating(false);
      if (data && data.projectId) {
        setLocation(`/projects/${data.projectId}`);
      }
    },
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setDeletingProjectId(null);
      void utils.projects.list.invalidate();
    },
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    createProjectMutation.mutate({
      name: projectName,
      description: `创建于 ${new Date().toLocaleDateString()}`,
    });
  };

  const handleDeleteProject = (projectId: number) => {
    deleteProjectMutation.mutate({ projectId });
  };

  const handleCompareDesigns = () => {
    if (selectedProjects.length >= 2) {
      const ids = selectedProjects.join(",");
      setLocation(`/compare?projects=${ids}`);
    }
  };

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">我的项目</h1>
              <p className="text-slate-400 mt-2">欢迎回来，{user?.name}</p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              新建项目
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Create Project Dialog */}
        {isCreating && (
          <div className="mb-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">创建新项目</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="项目名称"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || createProjectMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    "创建项目"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setProjectName("");
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Compare Button */}
        {selectedProjects.length >= 2 && (
          <div className="mb-6 bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 flex items-center justify-between">
            <p className="text-emerald-200">已选择 {selectedProjects.length} 个项目</p>
            <Button
              onClick={handleCompareDesigns}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              对比方案
            </Button>
          </div>
        )}

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : !projects ? (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-700 rounded-lg p-4">
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
                className={`bg-slate-800 border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer group ${
                  selectedProjects.includes(project.id) ? "border-emerald-500 ring-2 ring-emerald-500/50" : ""
                }`}
                onClick={() => {
                  if (selectedProjects.includes(project.id)) {
                    setSelectedProjects(selectedProjects.filter((id) => id !== project.id));
                  } else {
                    setSelectedProjects([...selectedProjects, project.id]);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex-1">
                      {project.name}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedProjects([...selectedProjects, project.id]);
                        } else {
                          setSelectedProjects(selectedProjects.filter((id) => id !== project.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-slate-600 cursor-pointer"
                    />
                  </div>
                  {project.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                      {project.status === "draft" && "草稿"}
                      {project.status === "completed" && "已完成"}
                      {project.status === "archived" && "已归档"}
                    </div>
                    <div className="flex gap-2">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setDeletingProjectId(project.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deletingProjectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">确认删除项目？</h2>
            <p className="text-slate-300 mb-6">
              删除后，该项目的所有设计方案和数据将被永久删除。此操作无法撤销。
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDeleteProject(deletingProjectId)}
                disabled={deleteProjectMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteProjectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    删除中...
                  </>
                ) : (
                  "确认删除"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingProjectId(null);
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
              >
                取消
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
