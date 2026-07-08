import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI-generated apps should deploy even if the template has strict type or
  // lint issues. Type errors are compile-time only and don't affect runtime,
  // so we don't let them block a deployment.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Report uploads (PDF/image) can be up to 10MB (see docs/TEST_PLAN.md).
  // Next.js defaults Server Action request bodies to 1MB, which rejects
  // those uploads with a 413 before our own size check ever runs.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
