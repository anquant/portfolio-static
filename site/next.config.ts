import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    scrollRestoration: true,
  },
};

export default config;
