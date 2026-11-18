import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { configured } from '@/lib/env';
import { absolute } from '@/lib/urls';
import { labs } from '@/lib/labs';
export const dynamic = 'force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const projects=configured?await db.project.findMany({where:{status:'PUBLISHED'},select:{slug:true,updatedAt:true}}):[];return [...['/','/projects','/gallery','/certificates','/resources'].map(p=>({url:absolute(p)})),...labs.map(lab=>({url:absolute(`/work/${lab.slug}`)})),...projects.map(p=>({url:absolute(`/projects/${p.slug}`),lastModified:p.updatedAt}))]}
