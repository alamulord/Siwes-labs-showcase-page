import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const id=z.uuid().parse(process.env.ADMIN_USER_ID);
const db=new PrismaClient();
try{
  await db.$transaction(async tx=>{
    // Singleton provisioning serialized across concurrent invocations.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(824507)`;
    const existing=await tx.adminProfile.findFirst();
    if(existing&&existing.id!==id)throw new Error("An administrator already exists. Explicitly revoke it before provisioning another.");
    const identities=await tx.$queryRaw<{id:string}[]>`SELECT id FROM auth.users WHERE id = ${id}::uuid`;
    if(!identities.length)throw new Error("Create the Supabase Auth user before provisioning.");
    await tx.adminProfile.upsert({where:{id},create:{id},update:{}});
  });
  console.log("Administrator provisioned. Authentication alone does not grant CMS access.");
}finally{await db.$disconnect();}
