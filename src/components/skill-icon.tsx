import { Code2,ShieldCheck,Network,Cloud,Terminal,Search } from "lucide-react";
const icons={code:Code2,shield:ShieldCheck,network:Network,cloud:Cloud,terminal:Terminal,search:Search};
export function SkillIcon({name}:{name:string}){const Icon=icons[name as keyof typeof icons]||Code2;return <Icon size={14} aria-hidden/>;}
