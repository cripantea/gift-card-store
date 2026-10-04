import path from "path";
import type { NextConfig } from "next";

// Intestazioni di sicurezza su tutte le pagine. Niente CSP completa: Stripe e
// PayPal caricano script e popup esterni; frame-ancestors basta a impedire che
// lo shop (e la cassa) vengano incorniciati da altri siti.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.leadconnectorhq.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
