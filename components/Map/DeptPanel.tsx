"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DeptResult, getCandidateColor } from "@/lib/electionData";

interface DeptPanelProps {
  dept: DeptResult | null;
  onClose: () => void;
}

export default function DeptPanel({ dept, onClose }: DeptPanelProps) {
  const sorted = dept
    ? Object.entries(dept.candidates)
        .filter(([n]) => n !== "Autres")
        .sort((a, b) => b[1].pct - a[1].pct)
    : [];
  const maxPct = sorted[0]?.[1].pct ?? 1;

  return (
    <AnimatePresence>
      {dept && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            onClick={onClose}
          />

          {/* Panel — bottom sheet on mobile, floating card on desktop */}
          <motion.div
            key="panel"
            // Mobile: slide up from bottom
            initial={{ y: "100%", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            // On md+: override to floating card (no transform needed — use opacity)
            className={[
              // Mobile base: bottom sheet
              "absolute bottom-0 left-0 right-0 z-30",
              "bg-[#0d0d14] border-t border-white/10 rounded-t-2xl shadow-2xl",
              "max-h-[60vh] overflow-y-auto",
              // Desktop override: floating card top-right
              "md:bottom-auto md:top-4 md:right-4 md:left-auto",
              "md:w-64 md:rounded-xl md:border md:border-white/10",
              "md:max-h-none md:overflow-visible",
              "glass",
            ].join(" ")}
            style={{ padding: "1rem" }}
          >
            {/* Handle — mobile only */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg md:text-base">{dept.name}</h3>
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
                className="text-gray-500 hover:text-white transition-colors text-2xl leading-none ml-2 shrink-0"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Results — 2 cols mobile, list desktop */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-0 md:space-y-2.5">
              {sorted.map(([name, { pct, votes }], i) => {
                const color = getCandidateColor(name);
                return (
                  <div key={name} className="md:contents">
                    {/* Mobile card */}
                    <div className="glass rounded-xl p-3 md:hidden">
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

                    {/* Desktop row */}
                    <div className="hidden md:block">
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
