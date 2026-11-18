import "server-only";
import { z } from "zod";
const schema = z.object({
  DATABASE_URL: z.string().startsWith("postgresql://").optional(),
  NEXT_PUBLIC_SITE_ORIGIN: z.url().refine(value=>{const u=new URL(value);return ["http:","https:"].includes(u.protocol)&&u.pathname==="/"&&!u.search&&!u.hash&&!u.username&&!u.password;},"Use an origin without a path or credentials").default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});
export const env = schema.parse(Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== "")));
export const configured = Boolean(env.DATABASE_URL);
