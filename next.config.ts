import type { NextConfig } from "next";

const isDesktopBuild = process.env.NEXT_OUTPUT === "export";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";

const nextConfig: NextConfig = {
  ...(isDesktopBuild
    ? {
        assetPrefix:
          process.env.NODE_ENV === "production"
            ? undefined
            : `http://${internalHost}:3000`,
        images: {
          unoptimized: true,
        },
        output: "export" as const,
      }
    : {}),
};

export default nextConfig;
