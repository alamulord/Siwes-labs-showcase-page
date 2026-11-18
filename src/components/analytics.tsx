"use client";
import { useEffect } from "react";
import { path } from "@/lib/urls";
export function TrackView({ target, kind = "PAGE" }: { target: string; kind?: "PAGE" | "PROJECT" }) {
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    const key = `view:${kind}:${target}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(path("/api/analytics"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, target }), keepalive: true }).catch(() => {});
  }, [target, kind]);
  return null;
}
