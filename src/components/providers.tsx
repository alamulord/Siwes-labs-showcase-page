"use client";
import { ThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
export function Providers({ children }: { children: React.ReactNode }) { return <ThemeProvider attribute="class" defaultTheme="dark" enableSystem><MotionConfig reducedMotion="user">{children}</MotionConfig></ThemeProvider>; }
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);
  return <button className="icon-button" aria-label="Toggle light or dark theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{mounted && resolvedTheme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>;
}
