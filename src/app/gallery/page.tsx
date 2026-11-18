import { TrackView } from "@/components/analytics";
import Link from "next/link";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { Gallery } from "@/components/gallery";
import { Empty } from "@/components/empty";
import { absolute } from "@/lib/urls";
export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery", alternates: { canonical: absolute("/gallery") } };
export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ group?: string; page?: string }> }) {
  const q = await searchParams; const group = typeof q.group === "string" ? q.group.slice(0,100) : ""; const page = Math.max(1, Math.min(10000, Math.floor(Number(q.page)) || 1));
  const [items, groups, total] = await Promise.all([configured ? db.galleryItem.findMany({ where: { status: "PUBLISHED", ...(group && { group }) }, include: { asset: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 24, skip: (page-1)*24 }) : [], configured ? db.galleryItem.findMany({ where: { status: "PUBLISHED" }, distinct: ["group"], select: { group: true } }) : [], configured ? db.galleryItem.count({ where: { status: "PUBLISHED", ...(group && { group }) } }) : 0]);
  return <div className="container"><TrackView target="/gallery" /><header className="page-head"><span className="eyebrow">Behind the work</span><h1>The gallery.</h1><p>Lab environments, screenshots, and supporting evidence.</p></header><div className="resource-actions" style={{ marginBottom: 30 }}><Link href="/gallery" className="button button-outline" aria-current={!group ? "page" : undefined}>All</Link>{groups.map(g => <Link key={g.group} href={`/gallery?group=${encodeURIComponent(g.group)}`} className="button button-outline" aria-current={group === g.group ? "page" : undefined}>{g.group}</Link>)}</div>{items.length ? <Gallery items={items.map(i => ({ id:i.id, title:i.title, caption:i.caption, assetId:i.assetId, alt:i.asset.alt }))} /> : <Empty /> }<nav className="pagination" aria-label="Gallery pages">{page>1 && <Link href={`/gallery?group=${encodeURIComponent(group)}&page=${page-1}`}>← Previous</Link>}{page*24<total && <Link href={`/gallery?group=${encodeURIComponent(group)}&page=${page+1}`}>Next →</Link>}</nav></div>;
}
