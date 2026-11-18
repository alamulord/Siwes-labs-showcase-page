import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { absolute } from "@/lib/urls";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const resource=configured ? await db.resource.findFirst({where:{id,status:"PUBLISHED"},select:{assetId:true}}) : null;
  if(!resource?.assetId)return new NextResponse("Not found",{status:404});
  const day=new Date(new Date().toISOString().slice(0,10));
  await db.analyticsDaily.upsert({where:{day_kind_target:{day,kind:"DOWNLOAD",target:id}},create:{day,kind:"DOWNLOAD",target:id,count:1},update:{count:{increment:1}}});
  return NextResponse.redirect(absolute(`/media/${resource.assetId}?download=1`),{headers:{"Cache-Control":"no-store"}});
}
