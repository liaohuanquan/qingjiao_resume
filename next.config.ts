import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  basePath: "/qingjiao_resume",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
