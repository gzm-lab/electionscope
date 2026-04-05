"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glow?: "blue" | "gold" | "none";
  animate?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  glow = "none",
  animate = false,
}: GlassPanelProps) {
  const glowClass = glow === "blue" ? "glow-blue" : glow === "gold" ? "glow-gold" : "";

  const content = (
    <div className={`glass rounded-xl ${glowClass} ${className}`}>{children}</div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass rounded-xl ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
