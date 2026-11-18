import { TrackView } from "@/components/analytics";
import { SecureImage } from "@/components/secure-image";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { date } from "@/lib/utils";
import { path, absolute } from "@/lib/urls";
import { Empty } from "@/components/empty";
export const dynamic = "force-dynamic";
export const metadata = { title: "Certificates", alternates: { canonical: absolute("/certificates") } };
export default async function Certificates() {
  const items = configured ? await db.certificate.findMany({ where:{status:"PUBLISHED"}, include:{thumbnail:true}, orderBy:{issueDate:"desc"} }) : [];
  return <div className="container"><TrackView target="/certificates" /><header className="page-head"><span className="eyebrow">Learning milestones</span><h1>Certificates.</h1><p>Credentials and supporting documents, with issuer information.</p></header><div className="grid">{items.map(c => <article className="resource-card" id={c.id} key={c.id}>{c.thumbnail && <SecureImage id={c.thumbnail.id} alt={c.thumbnail.alt} width={400} height={280} className="case-cover" />}<span className="eyebrow">{c.categoryId ? "Certificate" : "Learning credential"}</span><h3>{c.title}</h3><p>{c.issuer} · {date(c.issueDate)}</p><p>{c.description}</p>{c.credentialId && <p>Credential: {c.credentialId}</p>}<div className="resource-actions">{c.pdfId && <><a className="text-link" href={path(`/media/${c.pdfId}`)} target="_blank" rel="noopener noreferrer">Preview PDF ↗</a><a className="text-link" href={path(`/media/${c.pdfId}?download=1`)}>Download ↓</a></>}{c.credentialUrl && <a className="text-link" href={c.credentialUrl} rel="noopener noreferrer" target="_blank">Verify credential ↗</a>}</div></article>)}{!items.length && <Empty title="No certificates published" text="Only credentials you supply will be displayed here." />}</div></div>;
}
