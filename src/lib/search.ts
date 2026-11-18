import { z } from "zod";
import type { Prisma } from "@prisma/client";
const query = z.object({
  q: z.string().trim().max(120).catch(""), category: z.string().max(100).catch(""), technology: z.string().max(100).catch(""),
  difficulty: z.enum(["", "BEGINNER", "INTERMEDIATE", "ADVANCED"]).catch(""),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v).catch(""),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v).catch(""),
  sort: z.enum(["newest", "oldest", "title"]).catch("newest"), page: z.coerce.number().int().min(1).max(100000).catch(1)
});
export function parseSearch(input: Record<string, string | string[] | undefined>) {
  return query.parse(Object.fromEntries(Object.entries(input).map(([k,v]) => [k, Array.isArray(v) ? v[0] : v])));
}
export function projectWhere(f: ReturnType<typeof parseSearch>): Prisma.ProjectWhereInput {
  return { status: "PUBLISHED", ...(f.category && { categoryId: f.category }), ...(f.technology && { technologies: { some: { technologyId: f.technology } } }), ...(f.difficulty && { difficulty: f.difficulty }),
    ...((f.from || f.to) && { projectDate: { ...(f.from && { gte: new Date(f.from) }), ...(f.to && { lte: new Date(`${f.to}T23:59:59.999Z`) }) } }),
    ...(f.q && { OR: [{ title: { contains: f.q, mode: "insensitive" } }, { summary: { contains: f.q, mode: "insensitive" } }, { category: { name: { contains: f.q, mode: "insensitive" } } }, { tags: { some: { tag: { name: { contains: f.q, mode: "insensitive" } } } } }, { technologies: { some: { technology: { name: { contains: f.q, mode: "insensitive" } } } } }] }) };
}
export const pageSize = 9;
