/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoName = "AppPlanificadorViajes";

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  reactStrictMode: true,
  transpilePackages: ["leaflet", "react-leaflet"],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
