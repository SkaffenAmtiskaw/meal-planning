/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // AGENTS.md's "Library APIs" already points agents to Next's bundled docs
  agentRules: false,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
