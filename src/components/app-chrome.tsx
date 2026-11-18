'use client';
import { usePathname } from 'next/navigation';
import { Providers } from '@/components/providers';
export function AppChrome({children,header,footer}:{children:React.ReactNode;header:React.ReactNode;footer:React.ReactNode}){const pathname=usePathname();const portfolio=pathname==='/' || pathname.startsWith('/work/');return <Providers>{portfolio ? children : <>{header}<main id="main">{children}</main>{footer}</>}</Providers>}
