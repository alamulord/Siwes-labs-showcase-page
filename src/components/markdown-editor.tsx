"use client";
import { useState } from "react";
import { Markdown } from "./markdown";
export function MarkdownEditor({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <div className="editor"><label>Case study / Markdown note<textarea name="markdown" rows={20} value={value} onChange={e => setValue(e.target.value)} placeholder="## Problem statement\n\nDescribe the authorized environment, objectives, method, evidence, challenges, and lessons learned." /></label><div><span className="eyebrow">Live preview</span><Markdown content={value || "Your preview will appear here."} /></div></div>;
}
