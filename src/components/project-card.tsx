import Link from "next/link";
import { SecureImage } from "./secure-image";
import { ArrowUpRight, Network, ShieldCheck, Code2 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { projectInclude } from "@/lib/content";
import { date } from "@/lib/utils";
type CardProject = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;
export function ProjectCard({ project: p }: { project: CardProject }) {
  const Icon = p.projectType === "SECURITY_LAB" ? ShieldCheck : p.projectType === "NETWORKING" ? Network : Code2;
  return <Link href={`/projects/${p.slug}`} className="project-card"><div className="project-visual">{p.cover ? <SecureImage id={p.cover.id} fill sizes="(max-width: 760px) 100vw, 33vw" alt={p.cover.alt} /> : <div className="project-symbol"><Icon size={42} strokeWidth={1} /><span>{p.category.name}</span></div>}<span className="visual-label">{p.difficulty.toLowerCase()}</span></div><div className="project-info"><div className="card-meta"><span>{p.category.name}</span><time>{date(p.projectDate)}</time></div><h3>{p.title}<ArrowUpRight size={18} /></h3><p>{p.summary}</p><div className="tags">{p.technologies.slice(0, 4).map(t => <span key={t.technologyId}>{t.technology.name}</span>)}</div></div></Link>;
}
