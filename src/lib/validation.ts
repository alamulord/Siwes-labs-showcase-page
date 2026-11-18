import { z } from "zod";
import { isHttps, videoEmbed } from "./urls";
export const optionalUrl = z.string().max(2000).refine(v=>!v || isHttps(v),"Use an HTTPS URL without embedded credentials").transform(v=>v||null);
export const optionalText = z.string().max(5000).transform(v=>v||null);
export const requiredText = z.string().trim().min(1,"This field is required").max(200);
export const optionalDate = z.string().transform(v=>v ? new Date(v) : null).refine(v=>!v || !isNaN(v.getTime()),"Invalid date");
export const requiredDate = z.string().min(1).transform(v=>new Date(v)).refine(v=>!isNaN(v.getTime()),"Invalid date");
const ids = z.array(z.string().max(100)).max(50);
export const projectSchema = z.object({
  title:requiredText,slug:z.string().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,"Use lowercase words separated by hyphens"),summary:z.string().trim().min(1).max(500),markdown:z.string().max(100000),
  categoryId:requiredText,difficulty:z.enum(["BEGINNER","INTERMEDIATE","ADVANCED"]),projectType:z.enum(["SECURITY_LAB","PROGRAMMING","NETWORKING","RESEARCH","OTHER"]),projectDate:requiredDate,
  githubUrl:optionalUrl,liveUrl:optionalUrl,videoUrl:z.string().refine(v=>!v || Boolean(videoEmbed(v)),"Use a supported YouTube or Vimeo video URL"),
  coverId:optionalText,architectureId:optionalText,seoTitle:z.string().max(160).transform(v=>v||null),seoDescription:z.string().max(320).transform(v=>v||null),
  status:z.enum(["DRAFT","PUBLISHED"]),featured:z.boolean(),pinnedOrder:z.coerce.number().int().min(0).max(100000),tagIds:ids,technologyIds:ids,imageIds:ids,downloadIds:ids
}).superRefine((p,ctx)=>{ if(p.status === "PUBLISHED" && p.markdown.trim().length < 80) ctx.addIssue({code:"custom",path:["markdown"],message:"A published case study needs at least 80 characters of meaningful content"}); });
export type FormState = { error?: string; success?: string; fields?: Record<string,string[]> };
