import createNextIntlPlugin from "next-intl/plugin";
import { validateFrontendEnv } from "./env.validation.mjs";

if (process.env.NODE_ENV !== "production") {
  process.env.NEXT_PUBLIC_APP_URL ||= "http://localhost:3000";
  process.env.NEXT_PUBLIC_APP_NAME ||= "FUNKY";
}

const frontendEnv = validateFrontendEnv(process.env);
if (frontendEnv.productionDisabled) {
  process.env.NEXT_PUBLIC_APP_URL ||= "https://launch-disabled.funky.fan";
  process.env.NEXT_PUBLIC_APP_NAME ||= "FUNKY";
  console.warn(
    `[env] Production frontend public env is incomplete; API/on-chain features remain disabled until configured: ${frontendEnv.missing.join(", ")}`
  );
}

const withNextIntl = createNextIntlPlugin();
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const developmentImagePatterns = process.env.NODE_ENV === "production"
  ? []
  : [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ];

/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/socketconnect/:path*',
        destination: `${apiUrl}/:path*`,
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all domains
      },
      ...developmentImagePatterns,
    ],
    dangerouslyAllowSVG: true, // Optional: Allow SVG images (use with caution)
    unoptimized: true, // Optional: Disables Next.js image optimization
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  webpack: (config) => {
    // Prevent optional Node-only pino dependencies from being resolved in the browser
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Force pino to use its browser bundle
      'pino': 'pino/browser',
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false,
    };
    return config;
  }
};

export default withNextIntl(nextConfig);
