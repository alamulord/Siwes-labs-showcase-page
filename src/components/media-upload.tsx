"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { path } from "@/lib/urls";
export function MediaUpload() {
  const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
  async function upload(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setMessage("");const form=new FormData(e.currentTarget);const file=form.get("file");
    try {
      if(!(file instanceof File) || !file.size || file.size>25*1024*1024)throw new Error("Choose a file smaller than 25 MB.");
      if(/^image\//.test(file.type)&&file.size>5*1024*1024)throw new Error("Raster images must be smaller than 5 MB.");
      const signed=await fetch(path("/api/media/sign"),{method:"POST"});if(!signed.ok)throw new Error("Upload not authorized or Cloudinary is not configured.");
      const s=await signed.json();const payload=new FormData();payload.set("file",file);
      for(const k of ["timestamp","public_id","type","upload_preset","overwrite","signature","api_key"])payload.set(k,String(s[k]));
      const response=await fetch(`https://api.cloudinary.com/v1_1/${s.cloud_name}/auto/upload`,{method:"POST",body:payload});
      if(!response.ok)throw new Error("Cloudinary rejected this file. Check format, size, and the signed preset.");
      const result=await response.json();const complete=await fetch(path("/api/media/complete"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({publicId:result.public_id,resourceType:result.resource_type,alt:form.get("alt")})});
      if(!complete.ok)throw new Error("The uploaded asset could not be verified. It remains unattached; see abandoned-upload cleanup.");
      setMessage("Uploaded privately. Select this asset in a content editor to attach it.");router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}finally{setBusy(false);}
  }
  return <form className="resource-card form-stack" onSubmit={upload}><h2>Upload media</h2><p>Private by default. Images, PDF, MP4/WebM, text, ZIP, and PPTX; maximum 25 MB. Replace media by uploading a new file and changing the attachment in its content editor.</p><label>File<input name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.mp4,.webm,.txt,.zip,.pptx" required /></label><label>Meaningful alt text / file description<input name="alt" maxLength={200} required /></label><button className="button button-primary" disabled={busy}>{busy?"Uploading and verifying…":"Upload privately"}</button><p role="status">{message}</p></form>;
}
