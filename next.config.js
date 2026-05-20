/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "AppPlanificadorViajes";

const nextConfig = {
  output: "export",
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
  reactStrictMode: true,
  transpilePackages: ["leaflet", "react-leaflet"],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
