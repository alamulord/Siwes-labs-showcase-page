import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cmsSections, cms } from "@/lib/cms-config";
import { logout } from "@/app/login/actions";
export const dynamic="force-dynamic";
export const metadata={title:"Private CMS",robots:{index:false,follow:false}};
export default async function DashboardLayout({children}:{children:React.ReactNode}) {await requireAdmin();return <div className="container dashboard"><aside><Link href="/dashboard">Overview</Link>{cmsSections.map(s=><Link href={`/dashboard/${s}`} key={s}>{s==="projects"?"Projects":s==="analytics"?"Analytics":cms[s].title}</Link>)}<form action={logout}><button className="button button-ghost">Sign out</button></form></aside><main>{children}</main></div>;}
