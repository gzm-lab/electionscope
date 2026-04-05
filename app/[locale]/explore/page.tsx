"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";

import YearSelector from "@/components/Controls/YearSelector";
import TourSelector from "@/components/Controls/TourSelector";
import CandidateSelector from "@/components/Controls/CandidateSelector";
import IndicatorSelector, { Indicator } from "@/components/Controls/IndicatorSelector";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import GlassPanel from "@/components/UI/GlassPanel";

import { ELECTIONS, getElection } from "@/lib/elections";
import { generateMockResults } from "@/lib/mockData";

// Dynamic import for map (no SSR — maplibre needs browser)
const ElectionMap = dynamic(() => import("@/components/Map/ElectionMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f] rounded-xl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

// Dynamic import for scatter plot (uses D3 + browser)
const ScatterPlot = dynamic(() => import("@/components/Charts/ScatterPlot"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="shimmer w-full h-full rounded-lg" />
    </div>
  ),
});

export default function ExplorePage() {
  const t = useTranslations("explore");
  const locale = useLocale();

  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedTour, setSelectedTour] = useState<1 | 2>(1);
  const [indicator, setIndicator] = useState<Indicator>("none");

  const election = getElection(selectedYear);
  const candidates = election?.candidates ?? [];

  const [selectedCandidateId, setSelectedCandidateId] = useState(
    () => ELECTIONS[ELECTIONS.length - 1].candidates[0].id
  );

  // Reset candidate when year changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newElection = getElection(year);
    if (newElection && !newElection.candidates.find((c) => c.id === selectedCandidateId)) {
      setSelectedCandidateId(newElection.candidates[0].id);
    }
  };

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedCandidateId) ?? candidates[0],
    [candidates, selectedCandidateId]
  );

  const results = useMemo(
    () =>
      generateMockResults(
        selectedYear,
        selectedTour,
        candidates.map((c) => c.id)
      ),
    [selectedYear, selectedTour, candidates]
  );

  const topDepts = useMemo(() => {
    if (!selectedCandidate) return [];
    return [...results]
      .sort(
        (a, b) =>
          (b.candidates[selectedCandidate.id] ?? 0) - (a.candidates[selectedCandidate.id] ?? 0)
      )
      .slice(0, 5);
  }, [results, selectedCandidate]);

  const avgScore = useMemo(() => {
    if (!selectedCandidate) return 0;
    const scores = results.map((r) => r.candidates[selectedCandidate.id] ?? 0);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [results, selectedCandidate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top navbar */}
      <nav className="glass border-b border-white/5 px-6 py-3 flex items-center justify-between shrink-0">
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-lg font-black gradient-text">ElectionScope</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 hidden md:block">
            Données : Ministère de l'Intérieur · INSEE · data.gouv.fr
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-72 shrink-0 glass border-r border-white/5 overflow-y-auto p-4 flex flex-col gap-5"
        >
          {/* Election year */}
          <GlassPanel className="p-4">
            <YearSelector selectedYear={selectedYear} onYearChange={handleYearChange} />
          </GlassPanel>

          {/* Tour */}
          <GlassPanel className="p-4">
            <TourSelector selected={selectedTour} onSelect={setSelectedTour} />
          </GlassPanel>

          {/* Candidate */}
          <GlassPanel className="p-4">
            <CandidateSelector
              candidates={candidates}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
            />
          </GlassPanel>

          {/* Indicator */}
          <GlassPanel className="p-4">
            <IndicatorSelector selected={indicator} onSelect={setIndicator} />
          </GlassPanel>

          {/* Stats summary */}
          {selectedCandidate && (
            <GlassPanel className="p-4" glow="blue">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Résumé national
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Score moyen</div>
                  <div
                    className="text-2xl font-black"
                    style={{ color: selectedCandidate.color }}
                  >
                    {avgScore.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Top 5 départements</div>
                  <div className="space-y-1">
                    {topDepts.map((d) => (
                      <div key={d.code} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 truncate">{d.name}</span>
                        <span
                          className="text-xs font-bold ml-2"
                          style={{ color: selectedCandidate.color }}
                        >
                          {(d.candidates[selectedCandidate.id] ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          {/* Map title */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-lg font-bold text-white">
                Présidentielle {selectedYear} — {selectedTour === 1 ? "1er tour" : "2ème tour"}
              </h1>
              {selectedCandidate && (
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedCandidate.color }}
                  />
                  {selectedCandidate.name} · {selectedCandidate.party}
                </p>
              )}
            </div>
          </div>

          {/* Map */}
          <motion.div
            key={`${selectedYear}-${selectedTour}-${selectedCandidateId}`}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-h-0 rounded-xl overflow-hidden"
            style={{ minHeight: "400px" }}
          >
            {selectedCandidate && (
              <ElectionMap
                results={results}
                selectedCandidateId={selectedCandidateId}
                candidate={selectedCandidate}
              />
            )}
          </motion.div>

          {/* Scatter plot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 shrink-0"
            style={{ height: "260px" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-300">
                {t("scatterTitle")}
              </h2>
              {indicator !== "none" && (
                <span className="text-xs text-gray-500">96 départements</span>
              )}
            </div>
            <div style={{ height: "200px" }}>
              {selectedCandidate && (
                <ScatterPlot
                  results={results}
                  selectedCandidateId={selectedCandidateId}
                  candidate={selectedCandidate}
                  indicator={indicator}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
