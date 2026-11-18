"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cms, type Field } from "@/lib/cms-config";
import { saveContent } from "@/app/dashboard/actions";
import { MarkdownEditor } from "./markdown-editor";
import { Button } from "./ui/button";
import type { FormState } from "@/lib/validation";
type Options=Record<string,{id:string;label:string}[]>;
const projectFields:Field[]=[
 {name:"title",label:"Title",required:true},{name:"slug",label:"Unique URL slug",required:true},{name:"summary",label:"Summary",type:"textarea",required:true},{name:"categoryId",label:"Primary category",type:"select",source:"categories",required:true},
 {name:"difficulty",label:"Difficulty",type:"select",options:["BEGINNER","INTERMEDIATE","ADVANCED"]},{name:"projectType",label:"Project type",type:"select",options:["SECURITY_LAB","PROGRAMMING","NETWORKING","RESEARCH","OTHER"]},{name:"projectDate",label:"Project date",type:"date",required:true},
 {name:"githubUrl",label:"Source URL (HTTPS)"},{name:"liveUrl",label:"Live demo URL (HTTPS)"},{name:"videoUrl",label:"YouTube / Vimeo demonstration URL"},
 {name:"coverId",label:"Cover image",type:"select",source:"media"},{name:"architectureId",label:"Architecture diagram",type:"select",source:"media"},{name:"seoTitle",label:"SEO title"},{name:"seoDescription",label:"SEO description",type:"textarea"},
 {name:"status",label:"Publication status",type:"select",options:["DRAFT","PUBLISHED"]},{name:"featured",label:"Featured on homepage",type:"checkbox"},{name:"pinnedOrder",label:"Pinned order (lower first)",type:"number"}
];
export function CmsForm({section,id,initial={},options}:{section:string;id:string|null;initial?:Record<string,unknown>;options:Options}) {
  const router=useRouter();
  const [state,action,pending]=useActionState(saveContent.bind(null,section,id),{} as FormState);
  const [values,setValues]=useState<Record<string,unknown>>(initial);
  function update(name:string,value:unknown){setValues(v=>({...v,[name]:value}));setDirty(true);}
  const [dirty,setDirty]=useState(false);const ref=useRef<HTMLFormElement>(null);
  useEffect(()=>{
    function before(e:BeforeUnloadEvent){e.preventDefault();e.returnValue="";}
    function navigation(e:MouseEvent){const a=(e.target as Element).closest("a");if(a && !window.confirm("Discard unsaved edits?"))e.preventDefault();}
    if(dirty){window.addEventListener("beforeunload",before);document.addEventListener("click",navigation,true);}
    return()=>{window.removeEventListener("beforeunload",before);document.removeEventListener("click",navigation,true);};
  },[dirty]);
  useEffect(()=>{if(state.success){const frame=requestAnimationFrame(()=>{setDirty(false);if(section!=="settings")router.push(`/dashboard/${section}`);router.refresh();});return()=>cancelAnimationFrame(frame);}},[state,section,router]);
  const fields=section==="projects"?projectFields:cms[section].fields;
  function value(name:string){const v=values[name];return v==null?"":String(v);}
  return <form ref={ref} action={action} onChange={()=>setDirty(true)} className="form-stack">
    {state.error&&<div role="alert" className="notice error-notice">{state.error}</div>}
    {state.success&&<div role="status" className="notice">{state.success}</div>}
    <div className="form-grid">{fields.map(f=><label key={f.name} className={f.type==="textarea"?"wide":""}>
      {f.type==="checkbox"?<><input type="checkbox" name={f.name} checked={Boolean(values[f.name])} onChange={e=>update(f.name,e.target.checked)}/>{f.label}</>:<>
        {f.label}{f.required?" *":""}
        {f.type==="select"?<select name={f.name} value={value(f.name)||f.options?.[0]||""} onChange={e=>update(f.name,e.target.value)} required={f.required} aria-invalid={Boolean(state.fields?.[f.name])}>
          {!f.options&&<option value="">None / select…</option>}{f.options?.map(o=><option key={o}>{o}</option>)}{f.source&&options[f.source]?.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
        </select>:f.type==="textarea"?<textarea name={f.name} value={value(f.name)} onChange={e=>update(f.name,e.target.value)} rows={4} required={f.required} aria-invalid={Boolean(state.fields?.[f.name])}/>:<input name={f.name} type={f.type||"text"} value={value(f.name)||(f.type==="number"?"0":"")} onChange={e=>update(f.name,e.target.value)} required={f.required} aria-invalid={Boolean(state.fields?.[f.name])}/>}
      </>}{state.fields?.[f.name]?.map(msg=><span className="form-status" key={msg}>{msg}</span>)}
    </label>)}
    {section==="projects"&&["tags","technologies","images","downloads"].map(group=>{
      const source=group==="images"||group==="downloads"?"media":group;
      const name={tags:"tagIds",technologies:"technologyIds",images:"imageIds",downloads:"downloadIds"}[group]!;
      const selected=(values[name] as string[]|undefined)||[];
      const choices=options[source]||[];
      const ordered=[...selected.map(id=>choices.find(o=>o.id===id)).filter((v):v is {id:string;label:string}=>Boolean(v)),...choices.filter(o=>!selected.includes(o.id))];
      function move(index:number,delta:number){const next=[...selected];[next[index],next[index+delta]]=[next[index+delta],next[index]];update(name,next);}
      return <fieldset className="resource-card" key={group}><legend>{group} — select attachments</legend>{ordered.length?ordered.map(o=>{
        const position=selected.indexOf(o.id);
        return <div key={o.id}><label><input type="checkbox" name={name} value={o.id} checked={position>=0} onChange={e=>update(name,e.target.checked?[...selected,o.id]:selected.filter(id=>id!==o.id))}/>{o.label}</label>{group==="images"&&position>=0&&<div className="row-actions"><button type="button" className="button button-ghost button-small" disabled={position===0} onClick={()=>move(position,-1)} aria-label={`Move ${o.label} earlier`}>↑ Earlier</button><button type="button" className="button button-ghost button-small" disabled={position===selected.length-1} onClick={()=>move(position,1)} aria-label={`Move ${o.label} later`}>↓ Later</button></div>}</div>;
      }):<p>Add {source} first.</p>}</fieldset>;
    })}
  {(section==="projects"||section==="resources")&&<MarkdownEditor initial={value("markdown")}/>}</div>{section==="projects"&&<p>Publication requires a title, summary, unique slug, category, date, and a case study. Changing a slug preserves the old URL as a redirect. Screenshots follow selection order; captions and alt text are managed in Media.</p>}<div className="row-actions"><Button disabled={pending}>{pending?"Saving…":"Save changes"}</Button>{dirty&&<span className="form-status">Unsaved changes</span>}</div></form>;
}
