"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export type Indicator =
  | "revenue"
  | "unemployment"
  | "poverty"
  | "medecins_per_100k"
  | "pharmacies_per_100k"
  | "sau_pct"
  | "chasse_per_100k"
  | "lieux_culte_per_100k"
  | "rugby_clubs_per_100k"
  | "fast_food_per_100k"
  | "ensoleillement_h";

interface IndicatorSelectorProps {
  selected: Indicator;
  onSelect: (ind: Indicator) => void;
}

export default function IndicatorSelector({ selected, onSelect }: IndicatorSelectorProps) {
  const t = useTranslations("explore");

  const indicators: { id: Indicator; icon: string }[] = [
    { id: "revenue",            icon: "💶" },
    { id: "unemployment",       icon: "📊" },
    { id: "poverty",            icon: "📉" },
    { id: "medecins_per_100k",  icon: "👨‍⚕️" },
    { id: "pharmacies_per_100k",icon: "💊" },
    { id: "sau_pct",            icon: "🚜" },
    { id: "chasse_per_100k",    icon: "🎯" },
    { id: "lieux_culte_per_100k", icon: "⛪" },
    { id: "rugby_clubs_per_100k", icon: "🏈" },
    { id: "fast_food_per_100k", icon: "🍔" },
    { id: "ensoleillement_h",   icon: "☀️" },
  ];

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {t("indicatorLabel")}
      </label>
      <div className="flex flex-col gap-1.5">
        {indicators.map((ind) => (
          <motion.button
            key={ind.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(ind.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
              selected === ind.id
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            <span>{ind.icon}</span>
            <span>{t(`indicators.${ind.id}`)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
