"use client";

import { useMemo } from "react";
import { DeptResult, getCandidateColor } from "@/lib/electionData";
import { Indicator } from "@/components/Controls/IndicatorSelector";

interface SocioEcoTableProps {
  results: DeptResult[];
  socioeco: Record<string, Record<string, number>>;
  selectedCandidate: string;
  indicator: Indicator;
}

const INDICATOR_CONFIG: Record<Indicator, { label: string; unit: string; format: (v: number) => string }> = {
  revenue:              { label: "Revenu médian",        unit: "€/mois", format: (v) => v.toLocaleString("fr-FR") + " €" },
  unemployment:         { label: "Chômage",              unit: "%",      format: (v) => v.toFixed(1) + "%" },
  poverty:              { label: "Pauvreté",             unit: "%",      format: (v) => v.toFixed(1) + "%" },
  medecins_per_100k:    { label: "Médecins",             unit: "/100k",  format: (v) => v.toFixed(1) },
  pharmacies_per_100k:  { label: "Pharmacies",           unit: "/100k",  format: (v) => v.toFixed(1) },
  sau_pct:              { label: "Surface agricole",     unit: "%",      format: (v) => v.toFixed(1) + "%" },
  chasse_per_100k:      { label: "Tableaux de chasse",   unit: "/100k",  format: (v) => v.toFixed(0) },
  lieux_culte_per_100k: { label: "Lieux de culte",       unit: "/100k",  format: (v) => v.toFixed(1) },
  rugby_clubs_per_100k: { label: "Clubs rugby",          unit: "/100k",  format: (v) => v.toFixed(1) },
  fast_food_per_100k:   { label: "Fast-foods",           unit: "/100k",  format: (v) => v.toFixed(0) },
  ensoleillement_h:     { label: "Ensoleillement",       unit: "h/an",   format: (v) => v.toFixed(0) + " h" },
};

export default function SocioEcoTable({
  results,
  socioeco,
  selectedCandidate,
  indicator,
}: SocioEcoTableProps) {
  const color = getCandidateColor(selectedCandidate);
  const cfg = INDICATOR_CONFIG[indicator];

  const rows = useMemo(() => {
    return results
      .map((r) => {
        const eco = socioeco[r.code];
        if (!eco) return null;
        return {
          code: r.code,
          name: r.name,
          score: r.candidates[selectedCandidate]?.pct ?? 0,
          indicatorValue: (eco[indicator] as number) ?? 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.indicatorValue - a!.indicatorValue) as {
        code: string;
        name: string;
        score: number;
        indicatorValue: number;
      }[];
  }, [results, socioeco, selectedCandidate, indicator]);

  // Min/max pour les barres de progression
  const maxScore = Math.max(...rows.map((r) => r.score));
  const minIndicator = Math.min(...rows.map((r) => r.indicatorValue));
  const maxIndicator = Math.max(...rows.map((r) => r.indicatorValue));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_90px] gap-x-2 px-2 py-1.5 sticky top-0 bg-[#0d0d14] z-10 border-b border-white/5">
        <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider">Département</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-right" style={{ color: `${color}99` }}>
          {selectedCandidate}
        </span>
        <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider text-right">
          {cfg.label}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.03]">
        {rows.map((row) => {
          const scoreNorm = maxScore > 0 ? row.score / maxScore : 0;
          const indNorm =
            maxIndicator > minIndicator
              ? (row.indicatorValue - minIndicator) / (maxIndicator - minIndicator)
              : 0;

          return (
            <div
              key={row.code}
              className="grid grid-cols-[1fr_80px_90px] gap-x-2 px-2 py-1.5 hover:bg-white/[0.02] transition-colors"
            >
              {/* Nom */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] text-gray-700 shrink-0 font-mono">{row.code}</span>
                <span className="text-[10px] text-gray-400 truncate">{row.name}</span>
              </div>

              {/* Score candidat + barre */}
              <div className="flex flex-col justify-center items-end gap-0.5">
                <span className="text-[10px] font-semibold" style={{ color }}>
                  {row.score.toFixed(1)}%
                </span>
                <div className="w-full h-0.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${scoreNorm * 100}%`, backgroundColor: color, opacity: 0.6 }}
                  />
                </div>
              </div>

              {/* Valeur indicateur + barre */}
              <div className="flex flex-col justify-center items-end gap-0.5">
                <span className="text-[10px] text-gray-400 font-medium">
                  {cfg.format(row.indicatorValue)}
                </span>
                <div className="w-full h-0.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/50"
                    style={{ width: `${indNorm * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
