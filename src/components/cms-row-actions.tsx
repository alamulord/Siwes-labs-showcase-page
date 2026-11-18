"use client";
import { useState, useTransition } from "react";
import { removeContent, duplicateProject } from "@/app/dashboard/actions";
export function CmsRowActions({section,id}:{section:string;id:string}) {
  const [pending,start]=useTransition();const [error,setError]=useState("");
  function run(remove:boolean){if(remove&&!confirm("Delete this entry? Shared or referenced media and categories must be detached first."))return;start(async()=>{try{if(remove)await removeContent(section,id);else await duplicateProject(id);}catch{setError("Action failed. Check references and your administrator session.");}});}
  return <><button className="button button-danger button-small" disabled={pending} onClick={()=>run(true)}>Delete</button>{section==="projects"&&<button className="button button-outline button-small" disabled={pending} onClick={()=>run(false)}>Duplicate draft</button>}{error&&<span role="alert">{error}</span>}</>;
}
