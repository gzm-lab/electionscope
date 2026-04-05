"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ElectionIndex, getCandidateColor, CANDIDATE_COLORS } from "@/lib/electionData";

interface TimelineChartProps {
  index: ElectionIndex;
  tour: 1 | 2;
}

// Political family labels for the legend
const FAMILY_LABELS: Record<string, string> = {
  "#e11d48": "Gauche (PS)",
  "#b91c1c": "Gauche (PCF)",
  "#7c3aed": "France Insoumise",
  "#16a34a": "Verts",
  "#d97706": "Centre",
  "#2563eb": "En Marche / Renaissance",
  "#1e40af": "Droite (RPR/UMP/LR)",
  "#b45309": "Extrême droite (FN/RN)",
  "#dc2626": "Zemmour / Reconquête",
  "#6b7280": "Autres",
};

// Get top N candidates across all elections for a given tour
function getTopCandidates(index: ElectionIndex, tour: 1 | 2, topN = 8): string[] {
  const scores: Record<string, number> = {};
  for (const election of index.elections) {
    const national = tour === 1 ? election.national_t1 : election.national_t2;
    for (const [name, pct] of Object.entries(national)) {
      if (name === "Autres") continue;
      scores[name] = Math.max(scores[name] ?? 0, pct);
    }
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name]) => name);
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const sorted = [...payload]
    .filter((p) => p.value != null)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-2xl min-w-[160px]">
      <div className="text-xs font-bold text-white mb-2">Présidentielle {label}</div>
      {sorted.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 truncate max-w-[90px]">{entry.dataKey}</span>
          </div>
          <span className="font-bold" style={{ color: entry.color }}>
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TimelineChart({ index, tour }: TimelineChartProps) {
  const candidates = useMemo(() => getTopCandidates(index, tour, 8), [index, tour]);

  const data = useMemo(() => {
    return index.elections.map((election) => {
      const national = tour === 1 ? election.national_t1 : election.national_t2;
      const point: Record<string, number | string> = { year: election.year };
      for (const cand of candidates) {
        if (national[cand] != null) {
          point[cand] = national[cand];
        }
      }
      return point;
    });
  }, [index, tour, candidates]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Évolution historique · {tour === 1 ? "1er tour" : "2ème tour"}
        </h2>
        <span className="text-xs text-gray-600">% suffrages exprimés</span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#9ca3af", fontSize: 11 }}>{value}</span>
              )}
              wrapperStyle={{ paddingTop: 8 }}
            />
            {candidates.map((cand) => (
              <Line
                key={cand}
                type="monotone"
                dataKey={cand}
                stroke={getCandidateColor(cand)}
                strokeWidth={2}
                dot={{ r: 3, fill: getCandidateColor(cand), strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
