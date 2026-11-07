/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // AGENTS.md's "Library APIs" already points agents to Next's bundled docs
  agentRules: false,
  // Pins the root to this checkout, so a worktree nested in .claude/worktrees/ builds from itself
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
