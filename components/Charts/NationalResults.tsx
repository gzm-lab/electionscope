"use client";

import { motion } from "framer-motion";
import { DeptResult, getCandidateColor, computeNational } from "@/lib/electionData";

interface NationalResultsProps {
  results: DeptResult[];
  selectedCandidate: string | null;
  onSelectCandidate: (name: string) => void;
}

export default function NationalResults({ results, selectedCandidate, onSelectCandidate }: NationalResultsProps) {
  if (results.length === 0) return null;

  const national = computeNational(results);
  const sorted = Object.entries(national)
    .filter(([name]) => name !== "Autres")
    .sort((a, b) => b[1].pct - a[1].pct);

  const maxPct = sorted[0]?.[1].pct ?? 1;

  return (
    <div className="space-y-2">
      {sorted.map(([name, { pct, votes }], i) => {
        const color = getCandidateColor(name);
        const isSelected = selectedCandidate === name;
        return (
          <motion.button
            key={name}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCandidate(name)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
              isSelected ? "bg-white/8 ring-1 ring-white/15" : "hover:bg-white/4"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3">{i + 1}</span>
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">{name}</span>
              </div>
              <span className="text-sm font-black ml-2" style={{ color }}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(pct / maxPct) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
