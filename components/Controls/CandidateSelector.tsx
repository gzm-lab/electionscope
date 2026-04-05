"use client";

import { motion } from "framer-motion";
import { getCandidateColor } from "@/lib/electionData";

interface CandidateSelectorProps {
  candidates: string[];        // names from data
  selectedId: string | null;   // null = winner mode
  mapMode: "candidate" | "winner";
  onSelect: (name: string) => void;
  onWinnerMode: () => void;
}

export default function CandidateSelector({
  candidates,
  selectedId,
  mapMode,
  onSelect,
  onWinnerMode,
}: CandidateSelectorProps) {
  const mainCandidates = candidates.filter((c) => c !== "Autres");

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Candidat
      </label>

      {/* Winner mode toggle */}
      <motion.button
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWinnerMode}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2 text-left transition-all text-sm font-semibold ${
          mapMode === "winner"
            ? "bg-white/10 border border-white/20 text-white"
            : "glass text-gray-400 hover:text-white"
        }`}
      >
        <span className="text-base">🗺️</span>
        <span>Carte des gagnants</span>
        {mapMode === "winner" && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-blue-400 text-xs">✓</motion.span>
        )}
      </motion.button>

      <div className="flex flex-col gap-1">
        {mainCandidates.map((name) => {
          const color = getCandidateColor(name);
          const isSelected = mapMode === "candidate" && selectedId === name;
          return (
            <motion.button
              key={name}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(name)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                isSelected
                  ? "bg-white/8 border border-white/15"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-gray-400"}`}>
                {name}
              </span>
              {isSelected && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-xs text-blue-400">✓</motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
