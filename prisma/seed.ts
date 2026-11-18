import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
async function main(){
  for(const name of ["Networking","Web Security","Reconnaissance and OSINT","Linux","Automation","Web Development","Digital Forensics","CTFs","Miscellaneous"])await db.category.upsert({where:{name},create:{name},update:{}});
  for(const name of ["Python","Burp Suite","Wireshark","Nmap","Shodan"])await db.technology.upsert({where:{name},create:{name},update:{}});
  for(const [sortOrder,name]of ["Networking","Cybersecurity","Programming","Linux","Cloud","Web Development","Security Tools"].entries())await db.skillCategory.upsert({where:{name},create:{name,sortOrder},update:{}});
  await db.siteSettings.upsert({where:{id:"site"},create:{id:"site"},update:{}});
  if(process.env.SEED_DEMO==="true"){
    const category=await db.category.findUniqueOrThrow({where:{name:"Networking"}});
    await db.project.upsert({where:{slug:"demonstration-isolated-network-lab"},create:{title:"DEMONSTRATION — Isolated network lab",slug:"demonstration-isolated-network-lab",summary:"Demonstration content only. A template for documenting a lab on systems you own or are authorized to test; no personal achievements are claimed.",categoryId:category.id,projectType:"SECURITY_LAB",projectDate:new Date("2026-01-01"),status:"DRAFT",markdown:"## Demonstration content\n\nThis is a fictional documentation template, not a claim about the portfolio owner. Replace every section with your own authorized work before publishing.\n\n## Problem statement\nDescribe the isolated lab and its scope.\n\n## Objectives\nList what you intended to learn.\n\n## Method\nDocument your own implementation and architecture.\n\n## Challenges and solutions\nDescribe observed issues and how you addressed them.\n\n## Results and evidence\nAttach your own screenshots and describe actual observations.\n\n## Lessons learned\nReflect on your learning and next steps."},update:{}});
  }
}
main().finally(()=>db.$disconnect());
