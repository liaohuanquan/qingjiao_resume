"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-x-hidden">
      {/* 动态渐变背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-100/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* 顶部导航 */}
      <nav className="h-20 flex items-center justify-between px-8 lg:px-16 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-200/40 bg-white/60">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/"
            className="w-10 h-10 overflow-hidden rounded-full shadow-xl shadow-zinc-200/50 hover:scale-105 transition-transform active:scale-95"
          >
            <Image
              src="/qingjiao_resume/images/qinfjiao_resume.png"
              alt="青椒简历 Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </Link>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-500">
            青椒简历
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-500">
          <Link
            href="#features"
            className="hover:text-zinc-900 transition-colors"
          >
            功能特性
          </Link>
          <Link href="#" className="hover:text-zinc-900 transition-colors">
            精选模板
          </Link>
          <Link href="#" className="hover:text-zinc-900 transition-colors">
            成功案例
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/dashboard"
            className="hidden sm:block text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2"
          >
            登录
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-bold bg-zinc-900 text-white px-6 py-2.5 rounded-xl hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200 transition-all active:scale-95 flex items-center gap-2 group"
          >
            立即创建{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </motion.div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 lg:pt-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[13px] font-bold uppercase tracking-wider mb-8"
          >
            <Sparkles size={14} className="text-emerald-500" />
            全新 v2.0 编辑器现已发布
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-[72px] font-black tracking-tighter leading-[1.05] text-zinc-900 mb-8"
          >
            极简、专业 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-400">
              高效简历编辑器
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg lg:text-xl text-zinc-500 font-medium leading-relaxed mb-10"
          >
            专为求职者打造的高保真简历编辑工具。支持 PDF 一键导出、AI
            智能优化与实时同步，让您的面试邀约提升{" "}
            <span className="text-zinc-900 font-bold decoration-emerald-400/50 underline decoration-4 underline-offset-4">
              50% 以上
            </span>
            。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto h-14 px-8 bg-zinc-900 text-white rounded-xl text-base font-bold hover:bg-zinc-800 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              立刻开始创建{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/editor"
              className="w-full sm:w-auto h-14 px-8 bg-white border border-zinc-200 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm flex items-center justify-center gap-2 backdrop-blur-sm bg-white/50"
            >
              在线体验 Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 w-full max-w-5xl relative group"
          >
            {/* 装饰性背景光效 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

            <div className="relative bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-[2.5rem] border border-zinc-200/50 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="h-6 flex-1 mx-4 bg-zinc-100/50 rounded-lg" />
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-100 shadow-inner">
                <Image
                  src="/qingjiao_resume/images/hero-mockup.png"
                  alt="青椒简历编辑器界面投影"
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
              </div>
            </div>

            {/* 浮动标签 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 top-1/4 hidden lg:flex flex-col gap-2 p-5 bg-white rounded-3xl shadow-2xl border border-zinc-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase">
                    实时预览
                  </div>
                  <div className="text-sm font-black text-zinc-800 italic">
                    WYSIWYG
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -left-10 bottom-1/4 hidden lg:flex flex-col gap-2 p-5 bg-white rounded-3xl shadow-2xl border border-zinc-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Star size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase">
                    五星好评
                  </div>
                  <div className="text-sm font-black text-zinc-800">
                    4,000+ 用户
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 py-40">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              核心优势
            </h2>
            <p className="text-zinc-500 font-medium">
              为了极致的简历产出，我们打磨了每一个细节
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={Zap}
              title="极速响应"
              desc="直观的“所见即所得”编辑体验，毫秒级实时更新，极致流畅的响应速度。"
              delay={0.1}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="数据安全"
              desc="所有数据均加密存储，尊重并保护您的隐私。一键导出 PDF，无任何广告插播。"
              delay={0.2}
            />
            <FeatureCard
              icon={Sparkles}
              title="高保真 A4"
              desc="不仅是编辑器，更是排版专家。多套专业 A4 标准模板库，适应各行业求职需求。"
              delay={0.3}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-full shadow-sm">
              <Image
                src="/images/qinfjiao_resume.png"
                alt="青椒简历 Logo"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg">青椒简历</span>
          </div>
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest italic">
            Built for the future of recruiting
          </p>
          <div className="flex items-center gap-8 text-sm font-bold text-zinc-500">
            <Link href="#" className="hover:text-zinc-900">
              使用协议
            </Link>
            <Link href="#" className="hover:text-zinc-900">
              隐私政策
            </Link>
            <Link href="#" className="hover:text-zinc-900">
              GitHub
            </Link>
          </div>
        </div>
        <div className="mt-10 text-center text-zinc-300 text-xs font-medium">
          © 2026 青椒简历实验室 - 为求职而生
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col gap-5 p-10 bg-white border border-zinc-200/60 rounded-[3rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] hover:border-zinc-300/60 transition-all duration-500 hover:-translate-y-2 group"
    >
      <div className="w-14 h-14 bg-zinc-50 rounded-[1.25rem] flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
