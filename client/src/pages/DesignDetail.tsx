import { useParams, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Download, Image as ImageIcon } from "lucide-react";
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

  const projectIdNum = parseInt(projectId || "0");
  const designIdNum = parseInt(designId || "0");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Calls
  const { data: design } = trpc.designs.get.useQuery(
    { designId: designIdNum },
    { enabled: !!designId }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    // TODO: 实现实际的LLM调用和图像生成
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_response`,
        role: "assistant",
        content: `已收到您的指令: "${userMessage.content}"\n\n正在更新设计方案...这是一个演示响应。实际应用中，这里会调用LLM理解指令，并重新生成效果图。`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  if (!design) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const params = JSON.parse(design.parameters || "{}");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation(`/projects/${projectIdNum}/designs`)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← 返回
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{design.styleTheme}</h1>
                <p className="text-slate-400 mt-1">预算: ¥{design.budgetRange}</p>
              </div>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Download className="w-5 h-5 mr-2" />
              下载交付包
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Design Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              {/* Rendering Areas */}
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">效果图预览</h2>

                <div className="grid grid-cols-2 gap-4">
                  {["hall", "bar", "vip", "gaming"].map((area) => (
                    <div
                      key={area}
                      className="bg-slate-700 rounded-lg aspect-video flex items-center justify-center border border-slate-600 hover:border-emerald-500 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">
                          {area === "hall" && "大厅效果图"}
                          {area === "bar" && "吧台效果图"}
                          {area === "vip" && "VIP包间效果图"}
                          {area === "gaming" && "游戏区效果图"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">生成中...</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Design Parameters */}
                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">设计参数</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded p-4">
                      <p className="text-xs text-slate-400">总面积</p>
                      <p className="text-white font-bold">{params.totalArea} ㎡</p>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <p className="text-xs text-slate-400">机位数</p>
                      <p className="text-white font-bold">{params.machineCount} 个</p>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <p className="text-xs text-slate-400">包间数</p>
                      <p className="text-white font-bold">{params.privateRoomCount} 个</p>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <p className="text-xs text-slate-400">RGB密度</p>
                      <p className="text-white font-bold">{params.rgbDensity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Chat Interface */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">聊天式迭代</h3>
                <p className="text-sm text-slate-400 mt-1">输入指令修改设计</p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">
                      尝试输入指令，如：
                      <br />
                      "把吧台改大一点"
                      <br />
                      "加更多RGB灯带"
                      <br />
                      "改成紫色主题"
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">正在处理...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-700">
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
                    disabled={isGenerating}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isGenerating}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">按 Enter 发送，Shift+Enter 换行</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
