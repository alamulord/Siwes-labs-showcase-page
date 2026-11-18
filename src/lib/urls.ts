export function normalizeBasePath(value: string) {
  if (!value) return "";
  if (!/^\/[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9-]+)*$/.test(value)) throw new Error("Invalid deployment base path");
  return value;
}
export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || "");
export const origin = new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN || "http://localhost:3000").origin;
// Next Link adds basePath itself. Use path() for fetch, raw anchors and callbacks.
export function path(route = "/") { return `${basePath}${route.startsWith("/") ? route : `/${route}`}`; }
export function absolute(route = "/") { return new URL(path(route), origin).toString(); }
export function safeNext(value: string | null) {
  return value === "/dashboard" || /^\/dashboard\/[a-zA-Z0-9/_-]+$/.test(value || "") ? value! : "/dashboard";
}
export function isHttps(value: string) {
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}
export function videoEmbed(value: string) {
  if (!isHttps(value)) return null;
  const u = new URL(value);
  if (["youtube.com", "www.youtube.com", "youtu.be"].includes(u.hostname)) {
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (["vimeo.com", "www.vimeo.com"].includes(u.hostname) && /^\/\d+$/.test(u.pathname)) return `https://player.vimeo.com/video${u.pathname}`;
  return null;
}
