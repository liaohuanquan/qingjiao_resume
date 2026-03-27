import Link from "next/link";
import { Maximize2, ArrowRight, ShieldCheck, Zap, Sparkles, type LucideIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* 顶部导航 */}
      <nav className="h-20 flex items-center justify-between px-8 lg:px-16 bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
            <Maximize2 size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">青椒简历</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2"
          >
            登录
          </Link>
          <Link 
            href="/dashboard"
            className="text-sm font-bold bg-zinc-900 text-white px-6 py-2.5 rounded-xl hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200 transition-all active:scale-95"
          >
            免费开始
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={12} />
            全新 v2.0 编辑器现已发布
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-zinc-900">
            极简、专业 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400">高效简历编辑器</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-zinc-500 font-medium leading-relaxed">
            专为开发者与互联网精英打造的高保真简历编辑工具。支持 PDF 导出、AI 赋能与多端同步，让您的求职体验更上一层楼。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Link 
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-10 bg-zinc-900 text-white rounded-2xl text-lg font-bold hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200 hover:-translate-y-1 transition-all group"
            >
              立刻开始创建 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/editor"
              className="w-full sm:w-auto flex items-center justify-center h-14 px-10 bg-white border border-zinc-200 rounded-2xl text-lg font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
            >
              在线体验 Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 animate-in fade-in duration-1000 delay-300 fill-mode-both">
          <FeatureCard 
            icon={Zap}
            title="极速响应"
            desc="直观的“所见即所得”编辑体验，毫秒级实时更新预览效果。"
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="数据安全"
            desc="所有数据均加密存储于本地，我们绝不上传您的个人私密信息。"
          />
          <FeatureCard 
            icon={Maximize2}
            title="高保真导出"
            desc="完美匹配 A4 标准排版，精准还原每一像素的打印质感。"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200/50 bg-white/30 text-center">
        <p className="text-sm font-medium text-zinc-400">© 2026 青椒简历实验室 - 为求职而生</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-zinc-200 transition-all hover:-translate-y-2 group">
      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-500">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
