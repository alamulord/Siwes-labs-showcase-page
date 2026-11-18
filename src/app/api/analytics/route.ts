import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { origin } from "@/lib/urls";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(request:NextRequest) {
  if(!configured || request.headers.get("origin")!==origin)return new NextResponse(null,{status:204});
  try {
    await rateLimit("analytics-global",300,60);
    const p=z.object({kind:z.enum(["PAGE","PROJECT"]),target:z.string().max(150)}).parse(await request.json());
    if(p.kind==="PAGE" && !["/","/projects","/resources","/certificates","/gallery"].includes(p.target))return new NextResponse(null,{status:204});
    if(p.kind==="PROJECT" && !await db.project.findFirst({where:{id:p.target,status:"PUBLISHED"},select:{id:true}}))return new NextResponse(null,{status:204});
    const day=new Date(new Date().toISOString().slice(0,10));
    await db.analyticsDaily.upsert({where:{day_kind_target:{day,kind:p.kind,target:p.target}},create:{...p,day,count:1},update:{count:{increment:1}}});
  } catch { /* Analytics must never prevent navigation. */ }
  return new NextResponse(null,{status:204});
}
