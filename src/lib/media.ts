import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { db } from "./db";
import { env } from "./env";
import { assertAdmin } from "./auth";
export function cloud() {
  if(!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY)throw new Error("MEDIA_NOT_CONFIGURED");
  cloudinary.config({cloud_name:env.CLOUDINARY_CLOUD_NAME,api_key:env.CLOUDINARY_API_KEY,api_secret:env.CLOUDINARY_API_SECRET,secure:true});
  return cloudinary;
}
export const formats:Record<string,string>={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",avif:"image/avif",pdf:"application/pdf",mp4:"video/mp4",webm:"video/webm",txt:"text/plain",zip:"application/zip",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation"};
export function validateAsset(asset:{bytes:number;format:string;resource_type:string;type:string;public_id:string},prefix:string) {
  if(asset.type!=="authenticated" || !asset.public_id.startsWith(prefix) || !formats[asset.format] || asset.bytes<=0 || asset.bytes>25*1024*1024 || !["image","raw","video"].includes(asset.resource_type))throw new Error("INVALID_ASSET");
  if(asset.resource_type==="image"&&asset.format!=="pdf"&&asset.bytes>5*1024*1024)throw new Error("IMAGE_TOO_LARGE");
}
export async function isPublicAsset(id:string) {
  const found=await db.mediaAsset.findFirst({where:{id,OR:[{covers:{some:{status:"PUBLISHED"}}},{architectures:{some:{status:"PUBLISHED"}}},{projectImages:{some:{project:{status:"PUBLISHED"}}}},{projectDownloads:{some:{project:{status:"PUBLISHED"}}}},{gallery:{some:{status:"PUBLISHED"}}},{certificatePdfs:{some:{status:"PUBLISHED"}}},{certificateThumbnails:{some:{status:"PUBLISHED"}}},{resources:{some:{status:"PUBLISHED"}}}]},select:{id:true}});
  return Boolean(found);
}
export async function deleteMedia(id:string) {
  await assertAdmin();
  // Restrict foreign keys atomically reject shared/in-use assets before provider deletion.
  const asset=await db.mediaAsset.delete({where:{id}});
  try { await cloud().uploader.destroy(asset.publicId,{resource_type:asset.resourceType,type:"authenticated",invalidate:true}); }
  catch { console.error("Media provider cleanup failed; reconcile orphaned assets using the documented procedure."); }
}
