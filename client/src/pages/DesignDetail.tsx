import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { AlertCircle, Download, History, Image as ImageIcon, Loader2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast as sonnerToast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface RenderingItem {
  id?: number;
  designId?: number;
  area: string;
  url: string;
  label: string;
  version?: number;
  createdAt?: string | null;
  styleTheme?: string;
  isFallback?: boolean;
  fallbackReason?: string | null;
}

interface ViewerState {
  images: RenderingItem[];
  index: number;
}

const renderingAreas: RenderingItem[] = [
  { area: "entrance", label: "门头", url: "" },
  { area: "corridor", label: "通道", url: "" },
  { area: "bar", label: "吧台", url: "" },
  { area: "stage", label: "舞台", url: "" },
  { area: "seating", label: "散座", url: "" },
  { area: "private_room", label: "包间", url: "" },
  { area: "restroom", label: "卫生间", url: "" },
];

function buildFallbackImage(label: string) {
  const svg = `
    <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827" />
          <stop offset="55%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)" />
      <rect width="1280" height="720" fill="url(#glow)" />
      <rect x="48" y="48" width="1184" height="624" rx="28" fill="none" stroke="#22d3ee" stroke-opacity="0.45" />
      <text x="640" y="320" fill="#f8fafc" font-size="56" font-family="Arial, sans-serif" text-anchor="middle">${label}效果图</text>
      <text x="640" y="392" fill="#94a3b8" font-size="24" font-family="Arial, sans-serif" text-anchor="middle">Party K · 夜场霓虹 · KTV派对氛围 · 潮酷炫光视觉</text>
      <text x="640" y="448" fill="#22d3ee" font-size="22" font-family="Arial, sans-serif" text-anchor="middle">原图地址加载失败，当前展示为预览占位图</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function isFallbackRendering(rendering?: Pick<RenderingItem, "url" | "isFallback">) {
  return Boolean(rendering?.isFallback || rendering?.url?.startsWith("data:image/"));
}

export default function DesignDetail() {
  const { projectId, designId } = useParams<{ projectId: string; designId: string }>();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const projectIdNum = projectId ? parseInt(projectId, 10) : 0;
  const designIdNum = designId ? parseInt(designId, 10) : 0;
  const isValidProjectId = !isNaN(projectIdNum) && projectIdNum > 0;
  const isValidDesignId = !isNaN(designIdNum) && designIdNum > 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [regeneratingArea, setRegeneratingArea] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: design } = trpc.designs.get.useQuery(
    { designId: designIdNum },
    { enabled: isValidDesignId }
  );

  const renderingsQuery = trpc.renderings.list.useQuery(
    { designId: designIdNum },
    { enabled: isValidDesignId }
  );

  const generateRenderingsMutation = trpc.renderings.generate.useMutation({
    onSuccess: async (result) => {
      await utils.renderings.list.invalidate({ designId: designIdNum });
      if (result.fallbackCount > 0) {
        sonnerToast.warning("部分效果图暂未生成真实图片", {
          description:
            result.warningMessage || `本次有 ${result.fallbackCount} 张效果图因图像服务异常改为展示占位图。`,
        });
        return;
      }

      sonnerToast.success("效果图生成完成", {
        description: "7 个区域的效果图已刷新到当前页面。",
      });
    },
  });

  const regenerateAreaMutation = trpc.renderings.regenerateArea.useMutation({
    onSuccess: async (result) => {
      await utils.renderings.list.invalidate({ designId: designIdNum });
      if (result.fallbackCount > 0) {
        sonnerToast.warning("当前区域暂未生成真实图片", {
          description: result.warningMessage || "系统已自动展示占位图，您可以稍后再次尝试重生成。",
        });
        return;
      }

      sonnerToast.success("单张效果图已更新", {
        description: `${result.rendering.label} 已完成重生成。`,
      });
    },
  });

  const currentRenderings = useMemo(() => {
    const latest = (renderingsQuery.data?.renderings || []) as RenderingItem[];
    return renderingAreas.map((area) => latest.find((item) => item.area === area.area) || area);
  }, [renderingsQuery.data?.renderings]);

  const historyRenderings = useMemo(
    () => ((renderingsQuery.data?.history || []) as RenderingItem[]),
    [renderingsQuery.data?.history]
  );

  const fallbackRenderings = useMemo(
    () => currentRenderings.filter((rendering) => isFallbackRendering(rendering)),
    [currentRenderings]
  );

  const viewerImage = viewer ? viewer.images[viewer.index] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!viewer) return;
      if (event.key === "Escape") {
        setViewer(null);
      }
      if (event.key === "ArrowLeft") {
        setViewer((current) =>
          current
            ? {
                ...current,
                index: current.index === 0 ? current.images.length - 1 : current.index - 1,
              }
            : current
        );
      }
      if (event.key === "ArrowRight") {
        setViewer((current) =>
          current
            ? {
                ...current,
                index: current.index === current.images.length - 1 ? 0 : current.index + 1,
              }
            : current
        );
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewer]);

  const openViewer = (images: RenderingItem[], index: number) => {
    if (!images[index]?.url) return;
    const availableImages = images.filter((item) => item.url);
    const selected = images[index];
    const nextIndex = availableImages.findIndex(
      (item) => item.area === selected.area && item.version === selected.version && item.url === selected.url
    );

    setViewer({
      images: availableImages,
      index: nextIndex >= 0 ? nextIndex : 0,
    });
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, label: string) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === "true") return;
    target.dataset.fallbackApplied = "true";
    target.src = buildFallbackImage(label);
  };

  const handleGenerateRenderings = async () => {
    if (!design) return;
    await generateRenderingsMutation.mutateAsync({ designId: designIdNum });
    setActiveTab("current");
  };

  const handleRegenerateArea = async (area: string) => {
    setRegeneratingArea(area);
    try {
      await regenerateAreaMutation.mutateAsync({
        designId: designIdNum,
        area: area as "entrance" | "corridor" | "bar" | "stage" | "seating" | "private_room" | "restroom",
      });
      setActiveTab("current");
    } finally {
      setRegeneratingArea(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: `已理解您的指令：“${userMessage.content}”。后续可将这类指令直接用于单张图片重生成。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  if (!isValidProjectId || !isValidDesignId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">无效的参数</h2>
          </div>
          <p className="text-slate-300 mb-6">无法加载设计详情。请返回项目列表重新选择。</p>
          <Button onClick={() => setLocation("/dashboard")} className="w-full bg-emerald-500 hover:bg-emerald-600">
            返回项目列表
          </Button>
        </Card>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{design.styleTheme || "设计方案"}</h1>
              <p className="text-slate-400 mt-1">设计方案详情与实时迭代</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Download className="w-4 h-4 mr-2" />
                下载交付包
              </Button>
              <Button
                onClick={() => setLocation(`/projects/${projectIdNum}/designs`)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← 返回
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">设计参数</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">风格</p>
                  <p className="text-white font-medium">{design.styleTheme || "未指定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">预算等级</p>
                  <p className="text-white font-medium">{design.budgetRange || "未指定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">版本</p>
                  <p className="text-white font-medium">V{design.version || 1}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">室内效果图</h2>
                  <p className="text-sm text-slate-400 mt-1">支持查看当前项目下全部历史版本，并可对单张区域图单独重新生成，不影响其他图片。</p>
                </div>
                <Button
                  onClick={handleGenerateRenderings}
                  disabled={generateRenderingsMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {generateRenderingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      生成效果图
                    </>
                  )}
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-800/80 border border-slate-700">
                  <TabsTrigger value="current">当前效果图</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="w-4 h-4 mr-1" />
                    历史图片
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="mt-4 space-y-4">
                  {fallbackRenderings.length > 0 && (
                    <Card className="border-amber-500/40 bg-amber-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-amber-300" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-amber-100">
                            当前有 {fallbackRenderings.length} 张效果图正在显示占位图。
                          </p>
                          <p className="text-sm text-amber-200/90">
                            这通常表示图像服务暂时不可用或额度已用尽。您仍可继续查看布局与区域结果，稍后可对单张图片再次点击“单独重生成这张”获取真实出图。
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentRenderings.map((rendering, index) => (
                      <Card key={rendering.area} className="bg-slate-800 border-slate-700 overflow-hidden group">
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => rendering.url && openViewer(currentRenderings, index)}
                        >
                          <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
                            {rendering.url ? (
                              <img
                                src={rendering.url}
                                alt={rendering.label}
                                onError={(event) => handleImageError(event, rendering.label)}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-center px-4">
                                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">{rendering.label}效果图</p>
                              </div>
                            )}
                          </div>
                        </button>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-white font-medium">{rendering.label}</p>
                              <p className="text-xs text-slate-400">{rendering.version ? `当前版本 V${rendering.version}` : "尚未生成"}</p>
                              {isFallbackRendering(rendering) && (
                                <p className="mt-1 text-xs text-amber-300">
                                  当前显示占位图，稍后可重试生成真实图片。
                                </p>
                              )}
                            </div>
                            {rendering.url && (
                              <a
                                href={rendering.url}
                                download={`${rendering.area}.png`}
                                onClick={(event) => event.stopPropagation()}
                                className="text-slate-400 hover:text-white transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                            disabled={regeneratingArea === rendering.area}
                            onClick={() => handleRegenerateArea(rendering.area)}
                          >
                            {regeneratingArea === rendering.area ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                重生成中...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                单独重生成这张
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <Card className="bg-slate-800 border-slate-700 p-5">
                    {renderingsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-12 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        正在加载历史图片...
                      </div>
                    ) : historyRenderings.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        暂无历史图片，先生成一组效果图后，这里会显示当前项目下的全部版本记录。
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {historyRenderings.map((rendering, index) => (
                          <div
                            key={`${rendering.area}-${rendering.id ?? index}-${rendering.version ?? 1}`}
                            className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/40 hover:border-emerald-500 transition-colors"
                          >
                            <button
                              type="button"
                              className="w-full text-left"
                              onClick={() => openViewer(historyRenderings, index)}
                            >
                              <div className="aspect-video bg-slate-900 overflow-hidden">
                                <img
                                  src={rendering.url}
                                  alt={rendering.label}
                                  onError={(event) => handleImageError(event, rendering.label)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </button>
                            <div className="p-4 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-white font-medium">{rendering.label}</p>
                                <span className="text-xs text-emerald-400">V{rendering.version || 1}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                                  设计 #{rendering.designId || designIdNum}
                                </span>
                                {rendering.styleTheme && (
                                  <span className="rounded-full bg-slate-700 px-2 py-1 text-slate-300">{rendering.styleTheme}</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">
                                {rendering.createdAt ? new Date(rendering.createdAt).toLocaleString() : "时间未知"}
                              </p>
                              <a
                                href={rendering.url}
                                download={`${rendering.area}-v${rendering.version || 1}.png`}
                                className="inline-flex items-center text-xs text-slate-300 hover:text-white transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                下载该历史版本
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div>
            <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white">聊天式迭代</h2>
                <p className="text-sm text-slate-400 mt-1">当前可先通过“单独重生成这张”快速替换不满意的单张图片。</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">尝试输入修改指令，如：</p>
                    <ul className="text-slate-500 text-xs mt-3 space-y-1">
                      <li>• 把吧台灯光改得更亮</li>
                      <li>• 门头更像 Party K</li>
                      <li>• 舞台氛围再强一点</li>
                    </ul>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={`${msg.id}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-200 px-4 py-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入想优化的区域或氛围..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isGenerating}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {viewer && viewerImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewer(null)}>
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <h3 className="text-white font-semibold">{viewerImage.label}效果图</h3>
                <p className="text-xs text-slate-400">
                  {viewerImage.version ? `版本 V${viewerImage.version}` : "当前预览"}
                  {viewerImage.createdAt ? ` · ${new Date(viewerImage.createdAt).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewerImage.url}
                  download={`${viewerImage.area}-v${viewerImage.version || 1}.png`}
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  下载
                </a>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                  onClick={() =>
                    setViewer((current) =>
                      current
                        ? { ...current, index: current.index === 0 ? current.images.length - 1 : current.index - 1 }
                        : current
                    )
                  }
                >
                  上一张
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                  onClick={() =>
                    setViewer((current) =>
                      current
                        ? { ...current, index: current.index === current.images.length - 1 ? 0 : current.index + 1 }
                        : current
                    )
                  }
                >
                  下一张
                </button>
                <button type="button" className="text-slate-400 hover:text-white text-2xl leading-none px-2" onClick={() => setViewer(null)}>
                  ×
                </button>
              </div>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[calc(90vh-80px)] overflow-auto">
              <img
                src={viewerImage.url}
                alt={viewerImage.label}
                onError={(event) => handleImageError(event, viewerImage.label)}
                className="w-full h-full object-contain max-h-[calc(90vh-80px)]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
