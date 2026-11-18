"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useRef } from "react";
import { SecureImage } from "./secure-image";
import { path } from "@/lib/urls";
type Item = { id: string; title: string; caption: string; assetId: string; alt: string };
export function Gallery({ items }: { items: Item[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const opener=useRef<HTMLButtonElement|null>(null);
  const item = index === null ? null : items[index];
  return <><div className="grid">{items.map((i,n) => <button className="resource-card" key={i.id} onClick={e => {opener.current=e.currentTarget;setIndex(n);}}><div className="gallery-image"><SecureImage id={i.assetId} alt={i.alt} fill /></div><h3 style={{ marginTop: 18 }}>{i.title}</h3><p>{i.caption}</p></button>)}</div><Dialog.Root open={item !== null} onOpenChange={open => !open && setIndex(null)}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus();}} className="dialog-content" onKeyDown={e => { if(e.key === "ArrowRight") setIndex(((index ?? 0) + 1) % items.length); if(e.key === "ArrowLeft") setIndex(((index ?? 0) - 1 + items.length) % items.length); }}><Dialog.Title>{item?.title}</Dialog.Title><Dialog.Description>{item?.caption || "Use the arrow keys to browse images. Escape closes the viewer."}</Dialog.Description>{item && <img src={path(`/media/${item.assetId}`)} alt={item.alt} />}<div className="dialog-controls"><button className="button button-outline" onClick={() => setIndex(((index ?? 0) - 1 + items.length) % items.length)}>← Previous</button><Dialog.Close className="button button-outline">Close</Dialog.Close><button className="button button-outline" onClick={() => setIndex(((index ?? 0) + 1) % items.length)}>Next →</button></div></Dialog.Content></Dialog.Portal></Dialog.Root></>;
}
