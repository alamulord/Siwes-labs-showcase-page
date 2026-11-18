import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./providers";
import { settings } from "@/lib/content";
export async function Header() {
  return <header className="site-header"><div className="container header-inner"><Link href="/" className="brand"><span className="brand-icon"><ShieldCheck size={20} /></span>SIWES<span className="brand-divider">/</span><span className="brand-sub">Field notes</span></Link><nav aria-label="Main navigation"><Link href="/projects">Projects</Link><Link href="/#skills">Skills</Link><Link href="/#timeline">Timeline</Link><Link href="/resources">Resources</Link></nav><div className="header-actions"><ThemeToggle /><Link href="/#contact" className="contact-nav">Let’s connect <ArrowUpRight size={14} /></Link></div></div></header>;
}
export async function Footer() {
  const s = await settings();
  return <footer id="contact" className="container footer"><div><span className="eyebrow">Keep the conversation going</span><h2>Let’s build something secure.</h2><p>{s?.ethicalContext || "A record of learning, building, and responsible security research."}</p></div><div className="footer-links">{s?.email && <a href={`mailto:${s.email}`}>Email <ArrowUpRight size={14} /></a>}{s?.githubUrl && <a href={s.githubUrl} rel="noopener noreferrer" target="_blank">GitHub <ArrowUpRight size={14} /></a>}{s?.linkedinUrl && <a href={s.linkedinUrl} rel="noopener noreferrer" target="_blank">LinkedIn <ArrowUpRight size={14} /></a>}{s?.portfolioUrl && <a href={s.portfolioUrl} rel="noopener noreferrer" target="_blank">Main portfolio <ArrowUpRight size={14} /></a>}</div><div className="footer-bottom"><span>SIWES Cybersecurity Portfolio · Learning in public, responsibly.</span><Link href="/login">Administrator access</Link></div></footer>;
}
