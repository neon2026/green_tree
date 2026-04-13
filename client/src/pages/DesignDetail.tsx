import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Download, Image as ImageIcon, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DesignDetail() {
  const { projectId, designId } = useParams<{ projectId: string; designId: string }>();
  const [, setLocation] = useLocation();

  // 安全地解析参数
  const projectIdNum = projectId ? parseInt(projectId, 10) : 0;
  const designIdNum = designId ? parseInt(designId, 10) : 0;
  const isValidProjectId = !isNaN(projectIdNum) && projectIdNum > 0;
  const isValidDesignId = !isNaN(designIdNum) && designIdNum > 0;

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for renderings
  const [renderings, setRenderings] = useState<Array<{ area: string; url: string }>>([
    { area: "hall", url: "" },
    { area: "bar", url: "" },
    { area: "vip", url: "" },
    { area: "gaming", url: "" },
  ]);
  const [isGeneratingRenderings, setIsGeneratingRenderings] = useState(false);

  // API Calls
  const { data: design } = trpc.designs.get.useQuery(
    { designId: designIdNum },
    { enabled: isValidDesignId }
  );

  const generateRenderingsMutation = trpc.renderings.generate.useMutation();

  // 如果参数无效，显示错误页面
  if (!isValidProjectId || !isValidDesignId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">无效的参数</h2>
          </div>
          <p className="text-slate-300 mb-6">
            无法加载设计详情。请返回项目列表重新选择。
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerateRenderings = async () => {
    if (!design) return;
    
    setIsGeneratingRenderings(true);
    try {
      const result = await generateRenderingsMutation.mutateAsync({
        designId: designIdNum,
      });
      
      if (result.success && result.renderings) {
        setRenderings(
          result.renderings.map((r: any) => ({
            area: r.area,
            url: r.url,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to generate renderings:", error);
    } finally {
      setIsGeneratingRenderings(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: `已理解您的指令："${inputValue}"。正在更新设计方案...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  if (!design) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{design.styleTheme || "设计方案"}</h1>
              <p className="text-slate-400 mt-1">设计方案详情与实时迭代</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Renderings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Design Parameters */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">设计参数</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">风格</p>
                  <p className="text-white font-medium">{design.styleTheme || "未指定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">颜色主题</p>
                  <p className="text-white font-medium">{design.colorScheme || "未指定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">预算等级</p>
                  <p className="text-white font-medium">{design.budgetRange || "未指定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">造价估算</p>
                  <p className="text-emerald-400 font-semibold">
                    ¥490,000
                  </p>
                </div>
              </div>
            </Card>

            {/* Renderings Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">室内效果图</h2>
                <Button
                  onClick={handleGenerateRenderings}
                  disabled={isGeneratingRenderings}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {isGeneratingRenderings ? (
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
              <div className="grid grid-cols-2 gap-4">
                {renderings.map((rendering) => (
                  <Card
                    key={rendering.area}
                    className="bg-slate-800 border-slate-700 overflow-hidden hover:border-emerald-500 transition-colors"
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      {rendering.url ? (
                        <img
                          src={rendering.url}
                          alt={rendering.area}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">
                            {rendering.area === "hall" && "大厅效果图"}
                            {rendering.area === "bar" && "吧台效果图"}
                            {rendering.area === "vip" && "VIP包间效果图"}
                            {rendering.area === "gaming" && "游戏区效果图"}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Budget & Materials */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">预算估算</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">材料费用</span>
                  <span className="text-white font-medium">¥350,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">人工费用</span>
                  <span className="text-white font-medium">¥105,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">预留费用</span>
                  <span className="text-white font-medium">¥35,000</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-white font-semibold">总造价</span>
                  <span className="text-emerald-400 font-bold text-lg">¥490,000</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Chat */}
          <div>
            <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white">聊天式迭代</h2>
                <p className="text-sm text-slate-400 mt-1">输入修改指令，实时更新方案</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">
                      尝试输入修改指令，如：
                    </p>
                    <ul className="text-slate-500 text-xs mt-3 space-y-1">
                      <li>• 把吧台改大一点</li>
                      <li>• 加更多RGB灯带</li>
                      <li>• 改成紫色主题</li>
                    </ul>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={`${msg.id}-${index}`}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-700 text-slate-200"
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

              {/* Input */}
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
                    placeholder="输入修改指令..."
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
    </div>
  );
}
