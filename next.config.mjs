import { withPostHogConfig } from '@posthog/nextjs-config';

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

// Only Vercel's Production environment sets these. withPostHogConfig throws when source maps are on
// and either is missing, so the upload is on only when both are set.
const { POSTHOG_API_KEY, POSTHOG_PROJECT_ID } = process.env;

// The outermost wrapper, so its build hooks run. It uploads the browser's and the server's
// source maps to PostHog US Cloud, then deletes them from the output.
export default withPostHogConfig(nextConfig, {
  personalApiKey: POSTHOG_API_KEY ?? '',
  projectId: POSTHOG_PROJECT_ID,
  sourcemaps: {
    enabled: Boolean(POSTHOG_API_KEY && POSTHOG_PROJECT_ID),
  },
});
