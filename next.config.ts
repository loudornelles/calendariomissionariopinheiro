import type { NextConfig } from "next";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath =
  rawBasePath === ""
    ? ""
    : rawBasePath.startsWith("/")
      ? rawBasePath
      : `/${rawBasePath}`;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath === "" ? undefined : `${basePath}/`,
};

export default nextConfig;
