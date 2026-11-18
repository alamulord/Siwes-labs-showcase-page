import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function date(value: Date) { return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(value); }
