import type { NextConfig } from "next";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && !/^\/[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9-]+)*$/.test(basePath)) throw new Error("Invalid NEXT_PUBLIC_BASE_PATH");
const config: NextConfig = {
  basePath,
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.cloudinary.com; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" }
    ] }];
  }
};
export default config;
