import "server-only";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { db } from "./db";
import { configured } from "./env";
import { projectWhere, parseSearch, pageSize } from "./search";
export const projectInclude = { category: true, cover: true, tags: { include: { tag: true } }, technologies: { include: { technology: true } } } as const;
export const settings = unstable_cache(async () => configured ? db.siteSettings.findUnique({ where: { id: "site" }, include: { report: true } }) : null, ["settings"], { tags: ["content"], revalidate: 300 });
export const taxonomy = unstable_cache(async () => configured ? Promise.all([db.category.findMany({ orderBy: { name: "asc" } }), db.technology.findMany({ orderBy: { name: "asc" } })]) : [[], []] as const, ["taxonomy"], { tags: ["content"], revalidate: 300 });
export const projectPage = unstable_cache(async (f: ReturnType<typeof parseSearch>) => {
  if (!configured) return { items: [], total: 0 };
  const where = projectWhere(f);
  const [items, total] = await db.$transaction([db.project.findMany({ where, include: projectInclude, skip: (f.page - 1) * pageSize, take: pageSize, orderBy: f.sort === "title" ? [{ title: "asc" }, { id: "asc" }] : [{ projectDate: f.sort === "oldest" ? "asc" : "desc" }, { id: "asc" }] }), db.project.count({ where })]);
  return { items, total };
}, ["project-page"], { tags: ["content"], revalidate: 300 });
export const publicProject = unstable_cache(async (slug: string) => configured ? db.project.findFirst({ where: { slug, status: "PUBLISHED" }, include: { ...projectInclude, architecture: true, images: { include: { asset: true }, orderBy: { sortOrder: "asc" } }, downloads: { include: { asset: true } }, videos: true } }) : null, ["project"], { tags: ["content"], revalidate: 300 });
export function invalidateContent() {
  revalidateTag("content", { expire: 0 });
  revalidatePath("/", "layout");
}
