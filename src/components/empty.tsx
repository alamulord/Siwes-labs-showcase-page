import { FolderOpen } from "lucide-react";
export function Empty({ title = "Nothing published yet", text = "Published content will appear here when the administrator adds it." }: { title?: string; text?: string }) { return <div className="empty"><FolderOpen size={26} /><h3>{title}</h3><p>{text}</p></div>; }
