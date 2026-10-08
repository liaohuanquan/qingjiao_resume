import type { Metadata } from "next";
import "./globals.css";
import { AppEnvironment } from "./components/AppEnvironment";

export const metadata: Metadata = {
  title: "青椒简历",
  description:
    "本机保存、打印简历，支持自带 AI 服务。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className="h-full antialiased scroll-smooth"
    >
      <body className="font-sans min-h-full flex flex-col"><AppEnvironment>{children}</AppEnvironment></body>
    </html>
  );
}
