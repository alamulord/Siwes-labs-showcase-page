import "server-only";
import { db } from "./db";
import { assertAdmin } from "./auth";
export async function cmsRows(section:string, search="") {
  await assertAdmin();
  const title = search ? { contains:search.slice(0,120),mode:"insensitive" as const } : undefined;
  switch(section) {
    case "projects":return db.project.findMany({where:{title},orderBy:{updatedAt:"desc"},take:100});
    case "categories":return db.category.findMany({orderBy:{name:"asc"}});
    case "tags":return db.tag.findMany({orderBy:{name:"asc"}});
    case "technologies":return db.technology.findMany({orderBy:{name:"asc"}});
    case "skill-categories":return db.skillCategory.findMany({orderBy:{sortOrder:"asc"}});
    case "skills":return db.skill.findMany({orderBy:{sortOrder:"asc"}});
    case "timeline":return db.timelineEvent.findMany({orderBy:{sortOrder:"asc"}});
    case "gallery":return db.galleryItem.findMany({orderBy:{sortOrder:"asc"}});
    case "certificates":return db.certificate.findMany({orderBy:{issueDate:"desc"}});
    case "resources":return db.resource.findMany({orderBy:{sortOrder:"asc"}});
    case "media":return db.mediaAsset.findMany({orderBy:{createdAt:"desc"}});
    default:return [];
  }
}
export async function cmsOptions() {
  await assertAdmin();
  const [categories,tags,technologies,skillCategories,media,projects,resources] = await Promise.all([db.category.findMany(),db.tag.findMany(),db.technology.findMany(),db.skillCategory.findMany(),db.mediaAsset.findMany({orderBy:{createdAt:"desc"}}),db.project.findMany({select:{id:true,title:true}}),db.resource.findMany({where:{status:"PUBLISHED",assetId:{not:null}}})]);
  return {categories:categories.map(x=>({id:x.id,label:x.name})),tags:tags.map(x=>({id:x.id,label:x.name})),technologies:technologies.map(x=>({id:x.id,label:x.name})),skillCategories:skillCategories.map(x=>({id:x.id,label:x.name})),media:media.map(x=>({id:x.id,label:`${x.alt} (${x.format}, ${Math.round(x.bytes/1024)} KB)`})),projects:projects.map(x=>({id:x.id,label:x.title})),resources:resources.map(x=>({id:x.id,label:x.title}))};
}
export async function cmsAnalytics() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 90 * 86400000);
  const rows = await db.analyticsDaily.findMany({where:{day:{gte:cutoff}},orderBy:{day:"desc"},take:1000});
  const totals = rows.reduce<Record<string,number>>((a,r)=>({...a,[r.kind]:(a[r.kind]||0)+r.count}),{});
  return { rows, totals };
}
