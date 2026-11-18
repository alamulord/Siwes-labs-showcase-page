"use client";
import { motion,useReducedMotion } from "framer-motion";
export function MotionSurface({children}:{children:React.ReactNode}){const reduce=useReducedMotion();return <motion.div className="hero-notebook" whileHover={reduce?undefined:{rotate:0,y:-3}} transition={{duration:.25}}>{children}</motion.div>;}
