import type { Metadata } from 'next';
import { AppChrome } from '@/components/app-chrome';
import { Header, Footer } from '@/components/shell';
import './globals.css';
export const metadata:Metadata={title:'SIWES Cybersecurity Portfolio',description:'A documented portfolio of cybersecurity labs, practical exercises and skills developed during SIWES.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><a className="skip-link" href="#main">Skip to content</a><AppChrome header={<Header/>} footer={<Footer/>}>{children}</AppChrome></body></html>}
