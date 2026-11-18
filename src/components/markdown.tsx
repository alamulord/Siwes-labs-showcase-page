import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { isHttps } from "@/lib/urls";
export function headingId(text: string) { return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"); }
export function Markdown({ content }: { content: string }) {
  return <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} skipHtml components={{
    a: ({ href, children }) => isHttps(href || "") ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
    img: ({ src, alt }) => typeof src === "string" && /^https:\/\/res\.cloudinary\.com\//.test(src) ? <img src={src} alt={alt || ""} loading="lazy" /> : <span>{alt}</span>,
    h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>
  }}>{content}</ReactMarkdown></div>;
}
