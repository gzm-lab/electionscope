"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DeptResult, getCandidateColor } from "@/lib/electionData";
import { useEffect, useState } from "react";

interface DeptPanelProps {
  dept: DeptResult | null;
  onClose: () => void;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function DeptPanel({ dept, onClose }: DeptPanelProps) {
  const isMobile = useIsMobile();

  const sorted = dept
    ? Object.entries(dept.candidates)
        .filter(([n]) => n !== "Autres")
        .sort((a, b) => b[1].pct - a[1].pct)
    : [];
  const maxPct = sorted[0]?.[1].pct ?? 1;

  if (isMobile) {
    // Mobile: bottom sheet
    return (
      <AnimatePresence>
        {dept && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/40"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute bottom-0 left-0 right-0 z-30 bg-[#0d0d14] border-t border-white/10 rounded-t-2xl p-4 shadow-2xl"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{dept.name}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      Part. <span className="text-gray-300 font-semibold">{dept.turnout}%</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Exprimés <span className="text-gray-300 font-semibold">{dept.exprimes.toLocaleString("fr-FR")}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Results — 2 columns on mobile */}
              <div className="grid grid-cols-2 gap-3">
                {sorted.map(([name, { pct, votes }], i) => {
                  const color = getCandidateColor(name);
                  return (
                    <div key={name} className="glass rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-300 font-medium truncate">{name}</span>
                      </div>
                      <div className="text-xl font-black mb-1" style={{ color }}>
                        {pct.toFixed(1)}%
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(pct / maxPct) * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.04 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">{votes.toLocaleString("fr-FR")} voix</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: floating card top-right
  return (
    <AnimatePresence>
      {dept && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-4 right-4 z-30 glass rounded-xl p-4 w-64 shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">{dept.name}</h3>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-500">
                  Part. <span className="text-gray-300 font-semibold">{dept.turnout}%</span>
                </span>
                <span className="text-xs text-gray-500">
                  Exprimés <span className="text-gray-300 font-semibold">{dept.exprimes.toLocaleString("fr-FR")}</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          {/* Results */}
          <div className="space-y-2.5">
            {sorted.map(([name, { pct, votes }], i) => {
              const color = getCandidateColor(name);
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-300 font-medium truncate max-w-[120px]">{name}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(pct / maxPct) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="text-right mt-0.5">
                    <span className="text-xs text-gray-600">{votes.toLocaleString("fr-FR")} voix</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
