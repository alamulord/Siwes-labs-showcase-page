import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { publicProject, projectInclude } from "@/lib/content";
import { configured } from "@/lib/env";
import { db } from "@/lib/db";
import { absolute, path } from "@/lib/urls";
import { CaseStudy } from "@/components/case-study";
import { ProjectCard } from "@/components/project-card";
import { TrackView } from "@/components/analytics";
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params; const p = await publicProject(slug);
  if (!p) return { title: "Project unavailable", robots: { index: false, follow: false } };
  return { title: p.seoTitle || p.title, description: p.seoDescription || p.summary, alternates: { canonical: absolute(`/projects/${p.slug}`) }, openGraph: { title: p.title, description: p.summary, url: absolute(`/projects/${p.slug}`) } };
}
export default async function Project({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params; const p = await publicProject(slug);
  if (!p) {
    const r = configured ? await db.slugRedirect.findUnique({ where: { slug }, include: { project: { select: { status: true, slug: true } } } }) : null;
    if (r?.project.status === "PUBLISHED") permanentRedirect(path(`/projects/${r.project.slug}`));
    notFound();
  }
  const [related, previous, next] = await Promise.all([
    db.project.findMany({ where: { status: "PUBLISHED", categoryId: p.categoryId, id: { not: p.id } }, include: projectInclude, take: 3, orderBy: { projectDate: "desc" } }),
    db.project.findFirst({ where: { status: "PUBLISHED", projectDate: { lt: p.projectDate } }, select: { slug: true, title: true }, orderBy: { projectDate: "desc" } }),
    db.project.findFirst({ where: { status: "PUBLISHED", projectDate: { gt: p.projectDate } }, select: { slug: true, title: true }, orderBy: { projectDate: "asc" } })
  ]);
  const jsonLd = { "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.summary, datePublished: p.publishedAt?.toISOString(), url: absolute(`/projects/${p.slug}`) };
  return <div className="container"><TrackView kind="PROJECT" target={p.id} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g,"\\u003c") }} /><div className="narrow"><CaseStudy project={p} /></div><nav aria-label="Adjacent projects" className="pagination">{previous && <Link href={`/projects/${previous.slug}`}>← {previous.title}</Link>}{next && <Link href={`/projects/${next.slug}`}>{next.title} →</Link>}</nav>{related.length > 0 && <section className="section"><h2>Related work</h2><div className="grid">{related.map(r => <ProjectCard project={r} key={r.id} />)}</div></section>}</div>;
}
