import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, Zap, Palette, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            绿树电竞AI设计
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            登录
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-300 text-sm font-semibold">✨ 智能设计平台</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            从CAD到完整交付
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              一站式AI设计
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            上传平面图 → 智能生成5-10种风格方案 → 聊天式迭代修改 → 输出完整交付包
            <br />
            为西安绿树电竞打造专业、高效的室内设计解决方案
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 text-lg"
            >
              立即开始 →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-6 text-lg"
            >
              查看演示
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors">
              <Zap className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="font-semibold mb-2">智能CAD解析</h3>
              <p className="text-slate-400 text-sm">自动识别面积、机位、包间等关键参数</p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors">
              <Palette className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="font-semibold mb-2">多风格方案</h3>
              <p className="text-slate-400 text-sm">赛博朋克、未来科技等8种专业设计风格</p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors">
              <Sparkles className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-semibold mb-2">聊天式迭代</h3>
              <p className="text-slate-400 text-sm">自然语言指令驱动实时方案修改</p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors">
              <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="font-semibold mb-2">完整交付包</h3>
              <p className="text-slate-400 text-sm">效果图、施工图、材料清单</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">核心功能</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                  <span className="text-emerald-400 font-bold">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">CAD平面图解析</h3>
                <p className="text-slate-400">
                  支持DWG/DXF格式上传，自动识别总面积、机位数量、包间数量等关键空间参数，提供可视化展示和手动调整功能
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500/20 border border-cyan-500/50">
                  <span className="text-cyan-400 font-bold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">智能风格方案生成</h3>
                <p className="text-slate-400">
                  基于CAD参数和用户选择的颜色主题、预算区间，自动生成5-10种专业设计方案，涵盖赛博朋克、未来科技等多种风格
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 border border-blue-500/50">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI效果图渲染</h3>
                <p className="text-slate-400">
                  自动调用图像生成模型渲染高质量室内效果图，重点展示RGB灯带、吧台、包间、大厅等核心区域的视觉效果
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20 border border-green-500/50">
                  <span className="text-green-400 font-bold">4</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">聊天式方案迭代</h3>
                <p className="text-slate-400">
                  提供对话框供用户输入修改指令，AI实时理解并更新方案效果图，支持"把吧台改大一点""加更多RGB灯带"等自然语言指令
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/50">
                  <span className="text-purple-400 font-bold">5</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">完整交付包输出</h3>
                <p className="text-slate-400">
                  输出效果图（JPG/PNG）、施工图（DWG+PDF）、材料清单，一站式满足业主所有需求
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-500/20 border border-pink-500/50">
                  <span className="text-pink-400 font-bold">6</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">项目管理</h3>
                <p className="text-slate-400">
                  保存多个设计项目，查看历史方案版本，对比不同风格方案，支持材料档次调整
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">准备好开始了吗？</h2>
          <p className="text-xl text-slate-300 mb-8">
            加入西安绿树电竞，体验智能设计的未来
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 text-lg"
          >
            立即登录 →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-6 text-center text-slate-400">
        <p>&copy; 2026 绿树电竞AI设计平台. 所有权利保留。</p>
      </footer>
    </div>
  );
}
