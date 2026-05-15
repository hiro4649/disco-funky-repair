import createNextIntlPlugin from "next-intl/plugin";

process.env.NEXT_PUBLIC_APP_URL ||= "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_NAME ||= "FUNKY";

const withNextIntl = createNextIntlPlugin();
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
      {
        protocol: "http",
        hostname: "localhost", // allow localhost for development
      },
      {
        protocol: "http",
        hostname: "127.0.0.1", // allow 127.0.0.1 for development
      },
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
