import { TrackView } from "@/components/analytics";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { path, absolute } from "@/lib/urls";
import { Markdown } from "@/components/markdown";
import { Empty } from "@/components/empty";
export const dynamic = "force-dynamic";
export const metadata = { title: "Resources", alternates: { canonical: absolute("/resources") } };
export default async function Resources() {
  const items = configured ? await db.resource.findMany({ where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } }) : [];
  return <div className="container"><TrackView target="/resources" /><header className="page-head"><span className="eyebrow">The documentation shelf</span><h1>Resources & field notes.</h1><p>Reports, slides, useful links, and the thinking behind the work.</p></header><div className="form-stack">{items.map(r => <article className="resource-card" key={r.id} id={r.id}><span className="eyebrow">{r.resourceType}</span><h2>{r.title}</h2><p>{r.description}</p>{r.markdown && <Markdown content={r.markdown} />}<div className="resource-actions">{r.assetId && <><a className="text-link" href={path(`/media/${r.assetId}`)} rel="noopener noreferrer" target="_blank">Preview file ↗</a><a className="text-link" href={path(`/resources/${r.id}/download`)}>Download ↓</a></>}{r.externalUrl && <a className="text-link" href={r.externalUrl} rel="noopener noreferrer" target="_blank">Open resource ↗</a>}</div></article>)}{!items.length && <Empty />}</div></div>;
}
