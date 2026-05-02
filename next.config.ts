import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  disableLogger: true,
  autoInstrumentServerFunctions: true,
  sourcemaps: { disable: true },
});
