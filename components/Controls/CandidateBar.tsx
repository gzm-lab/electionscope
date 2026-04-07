"use client";

import { motion } from "framer-motion";
import { getCandidateColor } from "@/lib/electionData";

interface CandidateBarProps {
  candidates: string[];
  selectedId: string | null;
  mapMode: "candidate" | "winner";
  nationalScores: Record<string, number>; // name → % national
  onSelect: (name: string) => void;
  onWinnerMode: () => void;
}

export default function CandidateBar({
  candidates,
  selectedId,
  mapMode,
  nationalScores,
  onSelect,
  onWinnerMode,
}: CandidateBarProps) {
  const mainCandidates = candidates.filter((c) => c !== "Autres");

  return (
    <div className="shrink-0 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-sm px-2 md:px-6 py-2 md:py-3">
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">

        {/* Bouton Gagnants */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onWinnerMode}
          className={`relative shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            mapMode === "winner"
              ? "bg-white/10 ring-1 ring-white/25"
              : "hover:bg-white/5"
          }`}
        >
          <span className="text-base md:text-xl leading-none">🗺️</span>
          <span className={`text-[10px] md:text-sm font-semibold leading-none whitespace-nowrap ${
            mapMode === "winner" ? "text-white" : "text-gray-500"
          }`}>
            Gagnants
          </span>
          {mapMode === "winner" && (
            <motion.div
              layoutId="candidate-indicator"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white"
            />
          )}
        </motion.button>

        {/* Séparateur */}
        <div className="w-px h-8 bg-white/10 shrink-0 mx-0.5" />

        {/* Candidats */}
        {mainCandidates.map((name) => {
          const color = getCandidateColor(name);
          const isSelected = mapMode === "candidate" && selectedId === name;
          const score = nationalScores[name];
          // Nom court (nom de famille seulement)
          const shortName = name.split(" ").slice(-1)[0];

          return (
            <motion.button
              key={name}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(name)}
              className={`relative shrink-0 flex flex-col items-center gap-0.5 px-2.5 md:px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                isSelected ? "bg-white/8" : "hover:bg-white/5"
              }`}
            >
              {/* Dot couleur */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isSelected ? color : "transparent",
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? `0 0 10px ${color}60` : "none",
                  transition: "all 0.2s",
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-white/80"
                  />
                )}
              </div>

              {/* Nom */}
              <span
                className="text-[10px] md:text-sm font-semibold leading-none whitespace-nowrap"
                style={{ color: isSelected ? color : "#6b7280" }}
              >
                {shortName}
              </span>

              {/* Score national */}
              {score !== undefined && (
                <span
                  className="text-[10px] md:text-xs leading-none font-medium"
                  style={{ color: isSelected ? `${color}cc` : "#374151" }}
                >
                  {score.toFixed(1)}%
                </span>
              )}

              {/* Indicateur actif */}
              {isSelected && (
                <motion.div
                  layoutId="candidate-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
