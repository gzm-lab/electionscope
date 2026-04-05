"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Candidate } from "@/lib/elections";

interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CandidateSelector({
  candidates,
  selectedId,
  onSelect,
}: CandidateSelectorProps) {
  const t = useTranslations("explore");

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {t("candidateLabel")}
      </label>
      <div className="flex flex-col gap-2">
        {candidates.map((candidate) => (
          <motion.button
            key={candidate.id}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(candidate.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              selectedId === candidate.id
                ? "bg-white/10 border border-white/20"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-transparent"
              style={{ backgroundColor: candidate.color }}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{candidate.name}</div>
              <div
                className="text-xs font-semibold"
                style={{ color: candidate.color }}
              >
                {candidate.party}
              </div>
            </div>
            {selectedId === candidate.id && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto text-xs text-blue-400"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
