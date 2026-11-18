"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { invalidateContent } from "@/lib/content";
import { cms } from "@/lib/cms-config";
import { projectSchema, optionalUrl, optionalDate, requiredDate, requiredText, optionalText, type FormState } from "@/lib/validation";
import { deleteMedia } from "@/lib/media";
const status = z.enum(["DRAFT","PUBLISHED"]);
const order = z.coerce.number().int().min(0).max(100000);
const long = z.string().max(10000);
const idValue = z.string().max(100).transform(v=>v||null);
function raw(form:FormData,key:string) { const value=form.get(key); return typeof value === "string" ? value : ""; }
export async function saveContent(section:string,id:string|null,_previous:FormState,form:FormData):Promise<FormState> {
  try {
    await assertAdmin();
    if (!cms[section] && section !== "projects") throw new Error("Invalid section");
    if(section === "projects") {
      const p=projectSchema.parse({...Object.fromEntries(form),featured:form.get("featured")==="on",tagIds:form.getAll("tagIds"),technologyIds:form.getAll("technologyIds"),imageIds:form.getAll("imageIds"),downloadIds:form.getAll("downloadIds")});
      const {tagIds,technologyIds,imageIds,downloadIds,videoUrl,...fields}=p;
      await db.$transaction(async tx=>{
        const mediaIds=[...new Set([p.coverId,p.architectureId,...imageIds,...downloadIds].filter((v):v is string=>Boolean(v)))];
        const media=await tx.mediaAsset.findMany({where:{id:{in:mediaIds}}});
        if(media.length!==mediaIds.length)throw new Error("ASSET_NOT_FOUND");
        for(const assetId of [p.coverId,p.architectureId,...imageIds].filter(Boolean)){
          const image=media.find(a=>a.id===assetId);
          if(!image || image.resourceType!=="image" || !["png","jpg","jpeg","webp","avif"].includes(image.format))throw new Error("IMAGE_REQUIRED");
        }
        const previous=id ? await tx.project.findUniqueOrThrow({where:{id}}) : null;
        const reserved=await tx.slugRedirect.findUnique({where:{slug:p.slug}});
        if(reserved && reserved.projectId!==id) throw new Error("SLUG_RESERVED");
        if(previous && previous.slug!==p.slug) {
          await tx.slugRedirect.deleteMany({where:{slug:p.slug,projectId:previous.id}});
          await tx.slugRedirect.upsert({where:{slug:previous.slug},create:{slug:previous.slug,projectId:previous.id},update:{projectId:previous.id}});
        }
        const publishedAt=p.status === "PUBLISHED" ? previous?.publishedAt || new Date() : null;
        const project=id ? await tx.project.update({where:{id},data:{...fields,publishedAt}}) : await tx.project.create({data:{...fields,publishedAt}});
        await tx.projectTag.deleteMany({where:{projectId:project.id}}); await tx.projectTechnology.deleteMany({where:{projectId:project.id}}); await tx.projectImage.deleteMany({where:{projectId:project.id}}); await tx.projectDownload.deleteMany({where:{projectId:project.id}}); await tx.projectVideo.deleteMany({where:{projectId:project.id}});
        await tx.projectTag.createMany({data:[...new Set(tagIds)].map(tagId=>({projectId:project.id,tagId}))});
        await tx.projectTechnology.createMany({data:[...new Set(technologyIds)].map(technologyId=>({projectId:project.id,technologyId}))});
        await tx.projectImage.createMany({data:[...new Set(imageIds)].map((assetId,sortOrder)=>({projectId:project.id,assetId,sortOrder}))});
        await tx.projectDownload.createMany({data:[...new Set(downloadIds)].map(assetId=>({projectId:project.id,assetId,title:"Download supporting file"}))});
        if(videoUrl) await tx.projectVideo.create({data:{projectId:project.id,url:videoUrl}});
      });
    } else {
      const r=Object.fromEntries(cms[section].fields.map(f=>[f.name,f.type==="checkbox" ? form.get(f.name)==="on" : raw(form,f.name)]));
      const where={id:id||""};
      switch(section) {
        case "categories": {const data=z.object({name:requiredText}).parse(r); if(id) await db.category.update({where,data}); else await db.category.create({data});break;}
        case "tags": {const data=z.object({name:requiredText}).parse(r);if(id)await db.tag.update({where,data});else await db.tag.create({data});break;}
        case "technologies": {const data=z.object({name:requiredText}).parse(r);if(id)await db.technology.update({where,data});else await db.technology.create({data});break;}
        case "skill-categories": {const data=z.object({name:requiredText,sortOrder:order}).parse(r);if(id)await db.skillCategory.update({where,data});else await db.skillCategory.create({data});break;}
        case "skills": {const data=z.object({name:requiredText,categoryId:requiredText,icon:z.enum(["code","shield","network","cloud","terminal","search"]),proficiency:requiredText,evidenceUrl:optionalUrl,sortOrder:order}).parse(r);if(id)await db.skill.update({where,data});else await db.skill.create({data});break;}
        case "timeline": {const data=z.object({title:requiredText,startDate:requiredDate,endDate:optionalDate,description:long,projectId:idValue,sortOrder:order,status}).parse(r);if(data.endDate && data.endDate<data.startDate)throw new Error("DATE_ORDER");if(id)await db.timelineEvent.update({where,data});else await db.timelineEvent.create({data});break;}
        case "gallery": {const data=z.object({title:requiredText,assetId:requiredText,group:requiredText,caption:long,sortOrder:order,status}).parse(r);const asset=await db.mediaAsset.findUniqueOrThrow({where:{id:data.assetId}});if(asset.resourceType!=="image" || asset.format==="pdf")throw new Error("IMAGE_REQUIRED");if(id)await db.galleryItem.update({where,data});else await db.galleryItem.create({data});break;}
        case "certificates": {const data=z.object({title:requiredText,issuer:requiredText,issueDate:requiredDate,categoryId:idValue,description:long,credentialUrl:optionalUrl,credentialId:optionalText,pdfId:idValue,thumbnailId:idValue,status}).parse(r);if(data.pdfId){const pdf=await db.mediaAsset.findUniqueOrThrow({where:{id:data.pdfId}});if(pdf.format!=="pdf")throw new Error("PDF_REQUIRED");}if(data.thumbnailId){const image=await db.mediaAsset.findUniqueOrThrow({where:{id:data.thumbnailId}});if(image.resourceType!=="image"||image.format==="pdf")throw new Error("IMAGE_REQUIRED");}if(id)await db.certificate.update({where,data});else await db.certificate.create({data});break;}
        case "resources": {const data=z.object({title:requiredText,description:long,resourceType:z.enum(["REPORT","SLIDES","DOCUMENTATION","NOTE","LINK"]),categoryId:idValue,assetId:idValue,externalUrl:optionalUrl,sortOrder:order,status}).parse(r);const markdown=z.string().max(100000).parse(raw(form,"markdown"));if(data.status==="PUBLISHED" && !data.assetId && !data.externalUrl && !markdown.trim())throw new Error("RESOURCE_EMPTY");if(id)await db.resource.update({where,data:{...data,markdown}});else await db.resource.create({data:{...data,markdown}});break;}
        case "media": {const data=z.object({alt:requiredText,caption:long}).parse(r);await db.mediaAsset.update({where,data});break;}
        case "settings": {const data=z.object({name:requiredText,title:requiredText,introduction:long,role:z.string().max(200),organization:z.string().max(200),startDate:optionalDate,endDate:optionalDate,technologies:z.string().max(1000),githubUrl:optionalUrl,linkedinUrl:optionalUrl,email:z.union([z.email(),z.literal("")]).transform(v=>v||null),portfolioUrl:optionalUrl,seoDescription:z.string().max(320),ethicalContext:long,reportId:idValue,showGallery:z.boolean(),showTimeline:z.boolean()}).parse(r);if(data.startDate&&data.endDate&&data.endDate<data.startDate)throw new Error("DATE_ORDER");if(data.reportId && !await db.resource.findFirst({where:{id:data.reportId,status:"PUBLISHED",assetId:{not:null}}}))throw new Error("REPORT_INVALID");await db.siteSettings.upsert({where:{id:"site"},create:{id:"site",...data},update:data});break;}
      }
    }
    invalidateContent();
    return {success:"Saved successfully. Public content has been refreshed."};
  } catch(error) {
    if(error instanceof z.ZodError) return {error:"Please correct the highlighted fields. Your input has been preserved.",fields:z.flattenError(error).fieldErrors as Record<string,string[]>};
    return {error:"Could not save. Check unique names/slugs, required relationships, file types, dates, and your administrator session."};
  }
}
export async function removeContent(section:string,id:string):Promise<void> {
  await assertAdmin();
  const where={id:z.string().min(1).max(100).parse(id)};
  switch(section) {
    case "projects":await db.project.delete({where});break;
    case "categories":await db.category.delete({where});break;
    case "tags":await db.tag.delete({where});break;
    case "technologies":await db.technology.delete({where});break;
    case "skill-categories":await db.skillCategory.delete({where});break;
    case "skills":await db.skill.delete({where});break;
    case "timeline":await db.timelineEvent.delete({where});break;
    case "gallery":await db.galleryItem.delete({where});break;
    case "certificates":await db.certificate.delete({where});break;
    case "resources":await db.resource.delete({where});break;
    case "media":await deleteMedia(id);break;
    default:throw new Error("Invalid section");
  }
  invalidateContent();
}
export async function duplicateProject(id:string) {
  await assertAdmin();
  await db.$transaction(async tx=>{
    const p=await tx.project.findUniqueOrThrow({where:{id},include:{tags:true,technologies:true,images:true,downloads:true,videos:true}});
    const {id: _id,createdAt: _created,updatedAt: _updated,publishedAt: _published,tags,technologies,images,downloads,videos,...data}=p;
    void _id;void _created;void _updated;void _published;
    const copy=await tx.project.create({data:{...data,title:`${p.title} (copy)`,slug:`${p.slug}-copy-${crypto.randomUUID().slice(0,8)}`,status:"DRAFT",featured:false,pinnedOrder:0}});
    await tx.projectTag.createMany({data:tags.map(t=>({projectId:copy.id,tagId:t.tagId}))});
    await tx.projectTechnology.createMany({data:technologies.map(t=>({projectId:copy.id,technologyId:t.technologyId}))});
    await tx.projectImage.createMany({data:images.map(i=>({projectId:copy.id,assetId:i.assetId,caption:i.caption,sortOrder:i.sortOrder}))});
    await tx.projectDownload.createMany({data:downloads.map(d=>({projectId:copy.id,assetId:d.assetId,title:d.title}))});
    await tx.projectVideo.createMany({data:videos.map(v=>({projectId:copy.id,url:v.url,title:v.title}))});
  });
  invalidateContent();
}
