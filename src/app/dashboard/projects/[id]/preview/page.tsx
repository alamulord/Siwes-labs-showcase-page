import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectInclude } from "@/lib/content";
import { CaseStudy } from "@/components/case-study";
export default async function Preview({params}:{params:Promise<{id:string}>}){await requireAdmin();const {id}=await params;const p=await db.project.findUnique({where:{id},include:{...projectInclude,architecture:true,images:{include:{asset:true},orderBy:{sortOrder:"asc"}},downloads:{include:{asset:true}},videos:true}});if(!p)notFound();return <><div className="preview-banner">Private administrator preview · {p.status}</div><CaseStudy project={p} preview/></>;}
