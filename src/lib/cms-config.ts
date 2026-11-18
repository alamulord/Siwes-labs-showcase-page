export type Field = { name: string; label: string; type?: "text" | "textarea" | "date" | "number" | "checkbox" | "email" | "select"; options?: string[]; source?: string; required?: boolean };
const text = (name:string,label:string,required=false):Field => ({name,label,required});
const status:Field = {name:"status",label:"Visibility",type:"select",options:["DRAFT","PUBLISHED"]};
const order:Field = {name:"sortOrder",label:"Order (lower first)",type:"number"};
const category:Field = {name:"categoryId",label:"Category",type:"select",source:"categories"};
const asset = (name:string,label:string):Field => ({name,label,type:"select",source:"media"});
export const cms: Record<string,{title:string;fields:Field[]}> = {
  categories:{title:"Categories",fields:[text("name","Name",true)]},
  tags:{title:"Tags",fields:[text("name","Name",true)]},
  technologies:{title:"Technologies",fields:[text("name","Name",true)]},
  "skill-categories":{title:"Skill categories",fields:[text("name","Name",true),order]},
  skills:{title:"Skills",fields:[text("name","Skill",true),{name:"categoryId",label:"Skill category",type:"select",source:"skillCategories",required:true},{name:"icon",label:"Icon",type:"select",options:["code","shield","network","cloud","terminal","search"]},text("proficiency","Proficiency label",true),text("evidenceUrl","Evidence URL (HTTPS)"),order]},
  timeline:{title:"Timeline",fields:[text("title","Title",true),{name:"startDate",label:"Start date",type:"date",required:true},{name:"endDate",label:"End date",type:"date"},{name:"description",label:"Description",type:"textarea",required:true},{name:"projectId",label:"Related project",type:"select",source:"projects"},order,status]},
  gallery:{title:"Gallery",fields:[text("title","Title",true),{...asset("assetId","Image"),required:true},text("group","Group",true),{name:"caption",label:"Caption",type:"textarea"},order,status]},
  certificates:{title:"Certificates",fields:[text("title","Title",true),text("issuer","Issuer",true),{name:"issueDate",label:"Issue date",type:"date",required:true},category,{name:"description",label:"Description",type:"textarea"},text("credentialUrl","Credential URL (HTTPS)"),text("credentialId","Credential ID"),asset("pdfId","PDF"),asset("thumbnailId","Thumbnail"),status]},
  resources:{title:"Resources",fields:[text("title","Title",true),{name:"description",label:"Description",type:"textarea"},{name:"resourceType",label:"Resource type",type:"select",options:["REPORT","SLIDES","DOCUMENTATION","NOTE","LINK"]},category,asset("assetId","File"),text("externalUrl","External URL (HTTPS)"),order,status]},
  media:{title:"Media library",fields:[text("alt","Alt text",true),{name:"caption",label:"Caption",type:"textarea"}]},
  settings:{title:"Settings",fields:[text("name","Your name",true),text("title","Portfolio title",true),{name:"introduction",label:"Introduction",type:"textarea",required:true},text("role","Current role / training focus"),text("organization","Training organization"),{name:"startDate",label:"SIWES start date",type:"date"},{name:"endDate",label:"SIWES end date",type:"date"},text("technologies","Technologies learned (comma separated)"),text("githubUrl","GitHub URL (HTTPS)"),text("linkedinUrl","LinkedIn URL (HTTPS)"),{name:"email",label:"Contact email",type:"email"},text("portfolioUrl","Main portfolio URL (HTTPS)"),{name:"seoDescription",label:"Default SEO description",type:"textarea"},{name:"ethicalContext",label:"Ethical research context",type:"textarea"},{name:"reportId",label:"Homepage report",type:"select",source:"resources"},{name:"showGallery",label:"Show homepage gallery",type:"checkbox"},{name:"showTimeline",label:"Show homepage timeline",type:"checkbox"}]}
};
export const cmsSections = ["projects","gallery","certificates","resources","categories","tags","technologies","skills","skill-categories","timeline","media","analytics","settings"];
