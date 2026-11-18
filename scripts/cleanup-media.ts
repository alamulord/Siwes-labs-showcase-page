import { PrismaClient } from "@prisma/client";
import { v2 as cloud } from "cloudinary";
const db=new PrismaClient();
cloud.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
try{
  await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});
  await db.analyticsDaily.deleteMany({where:{day:{lt:new Date(Date.now()-90*86400000)}}});
  let cursor:string|undefined;
  do{
    const page=await cloud.api.resources({type:"authenticated",prefix:"siwes/",resource_type:"image",max_results:100,next_cursor:cursor});
    for(const asset of page.resources){
      if(new Date(asset.created_at).getTime()>Date.now()-86400000)continue;
      if(!await db.mediaAsset.findUnique({where:{providerAssetId:asset.asset_id}}))console.log(`Untracked image asset: ${asset.public_id}. Review in Cloudinary before deletion.`);
    }
    cursor=page.next_cursor;
  }while(cursor);
  console.log("Expired rate buckets and analytics removed. Image reconciliation is read-only; also audit raw/video assets in Cloudinary.");
}finally{await db.$disconnect();}
