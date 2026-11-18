import type { MetadataRoute } from "next";
import { absolute, path } from "@/lib/urls";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: path("/"), disallow: [path("/dashboard"), path("/login"), path("/api"), path("/auth")] }, sitemap: absolute("/sitemap.xml") }; }
