"use client";

import { motion } from "framer-motion";

const YEARS = [2002, 2007, 2012, 2017, 2022];

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Élection
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {YEARS.map((year) => (
          <motion.button
            key={year}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onYearChange(year)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedYear === year
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "glass text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {year}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
