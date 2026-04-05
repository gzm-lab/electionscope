"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type TourType = 1 | 2;

interface TourSelectorProps {
  selected: TourType;
  onSelect: (tour: TourType) => void;
}

export default function TourSelector({ selected, onSelect }: TourSelectorProps) {
  const t = useTranslations("explore");

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {t("tourLabel")}
      </label>
      <div className="flex gap-2">
        {([1, 2] as TourType[]).map((tour) => (
          <motion.button
            key={tour}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(tour)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              selected === tour
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            {tour === 1 ? t("tour1") : t("tour2")}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
