import { it,expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/markdown";
it("disables raw HTML and unsafe links",()=>{const html=renderToStaticMarkup(<Markdown content={'<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n[good](https://example.com)\n\n![bad](https://attacker.example/pixel.png)'}/>);expect(html).not.toContain("<script");expect(html).not.toContain("javascript:");expect(html).not.toContain('src="https://attacker');expect(html).toContain('rel="noopener noreferrer"');expect(html).toContain('href="https://example.com"');});
