import Link from "next/link";
export default function NotFound() { return <div className="container page-head"><span className="eyebrow">404 / Not found</span><h1>This page is unavailable.</h1><p>The content may have moved or is not published.</p><Link className="button button-primary" href="/projects">Explore projects</Link></div>; }
