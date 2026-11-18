import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { cms } from "@/lib/cms-config";
import { cmsRows, cmsOptions } from "@/lib/cms-data";
import { db } from "@/lib/db";
import { CmsForm } from "@/components/cms-form";
export default async function Edit({params}:{params:Promise<{section:string;id:string}>}) {
  await requireAdmin();const {section,id}=await params;if(section!=="projects"&&!cms[section])notFound();if(["settings","analytics"].includes(section))notFound();
  const options=await cmsOptions();let record:Record<string,unknown>={};
  if(id!=="new"){
    if(section==="projects"){
      const p=await db.project.findUnique({where:{id},include:{tags:true,technologies:true,images:{orderBy:{sortOrder:"asc"}},downloads:true,videos:true}});if(!p)notFound();
      record={...p,tagIds:p.tags.map(t=>t.tagId),technologyIds:p.technologies.map(t=>t.technologyId),imageIds:p.images.map(i=>i.assetId),downloadIds:p.downloads.map(d=>d.assetId),videoUrl:p.videos[0]?.url||""};
    }else{const rows=await cmsRows(section);const found=rows.find(r=>r.id===id);if(!found)notFound();record=found as unknown as Record<string,unknown>;}
  }
  const initial=JSON.parse(JSON.stringify(record));for(const [k,v]of Object.entries(initial))if(/Date$/.test(k)&&typeof v==="string")initial[k]=v.slice(0,10);
  return <><h1>{id==="new"?"Create":"Edit"} {section==="projects"?"project":cms[section].title.toLowerCase()}</h1><p>Changes are validated on the server. Use the order field for keyboard-accessible ordering.</p><CmsForm key={`${section}:${id}`} section={section} id={id==="new"?null:id} initial={initial} options={options}/></>;
}
