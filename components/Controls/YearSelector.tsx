"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ELECTIONS } from "@/lib/elections";

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
  const t = useTranslations("explore");

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {t("yearLabel")}
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {ELECTIONS.map((election) => (
          <motion.button
            key={election.year}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onYearChange(election.year)}
            className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedYear === election.year
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "glass text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {election.year}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
