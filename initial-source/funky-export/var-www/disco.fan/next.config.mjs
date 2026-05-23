import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
      {
        source: '/socketconnect/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all domains
      },
    ],
    dangerouslyAllowSVG: true, // Optional: Allow SVG images (use with caution)
    unoptimized: true, // Optional: Disables Next.js image optimization
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  }
};

export default withNextIntl(nextConfig);
