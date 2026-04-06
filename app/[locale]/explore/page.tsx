"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "next-intl";

import YearSelector from "@/components/Controls/YearSelector";
import TourSelector from "@/components/Controls/TourSelector";
import CandidateSelector from "@/components/Controls/CandidateSelector";
import IndicatorSelector, { Indicator } from "@/components/Controls/IndicatorSelector";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import NationalResults from "@/components/Charts/NationalResults";
import DeptPanel from "@/components/Map/DeptPanel";

import {
  loadElectionResults,
  loadIndex,
  DeptResult,
  ElectionIndex,
} from "@/lib/electionData";

const ElectionMap = dynamic(() => import("@/components/Map/ElectionMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f] rounded-xl">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const ScatterPlot = dynamic(() => import("@/components/Charts/ScatterPlot"), {
  ssr: false,
  loading: () => <div className="w-full h-full shimmer rounded-lg" />,
});

const TimelineChart = dynamic(() => import("@/components/Charts/TimelineChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full shimmer rounded-lg" />,
});

export default function ExplorePage() {
  const locale = useLocale();

  const [index, setIndex] = useState<ElectionIndex | null>(null);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedTour, setSelectedTour] = useState<1 | 2>(1);
  const [results, setResults] = useState<DeptResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [mapMode, setMapMode] = useState<"candidate" | "winner">("winner");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<DeptResult | null>(null);

  const [socioeco, setSocioeco] = useState<Record<string, { revenue: number; unemployment: number; poverty: number }>>({});
  const [indicator, setIndicator] = useState<Indicator>("revenue");

  const [sidebarTab, setSidebarTab] = useState<"controls" | "results">("controls");
  const [showTimeline, setShowTimeline] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    loadIndex().then(setIndex);
    fetch("/data/socioeco.json").then(r => r.json()).then(setSocioeco);
  }, []);

  const candidates = useMemo(() => {
    if (!index) return [];
    const election = index.elections.find((e) => e.year === selectedYear);
    if (!election) return [];
    return selectedTour === 1 ? election.candidates_t1 : election.candidates_t2;
  }, [index, selectedYear, selectedTour]);

  useEffect(() => {
    setLoading(true);
    loadElectionResults(selectedYear, selectedTour).then((data) => {
      setResults(data);
      setLoading(false);
    });
    setSelectedDept(null);
  }, [selectedYear, selectedTour]);

  useEffect(() => {
    if (candidates.length > 0 && (!selectedCandidate || !candidates.includes(selectedCandidate))) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleYearChange = useCallback((year: number) => setSelectedYear(year), []);
  const handleTourChange = useCallback((tour: 1 | 2) => setSelectedTour(tour), []);
  const handleSelectCandidate = useCallback((name: string) => {
    setSelectedCandidate(name);
    setMapMode("candidate");
    setSheetOpen(false);
  }, []);
  const handleWinnerMode = useCallback(() => {
    setMapMode("winner");
    setSelectedCandidate(null);
  }, []);

  const effectiveCandidate = mapMode === "candidate" ? selectedCandidate : (candidates[0] ?? null);

  // Sidebar/sheet content
  const sidebarContent = (
    <>
      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0">
        {(["controls", "results"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSidebarTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              sidebarTab === tab ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "controls" ? "🎛️ Contrôles" : "📊 Résultats"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sidebarTab === "controls" ? (
          <div className="p-3 space-y-4">
            <div className="glass rounded-xl p-3">
              <YearSelector selectedYear={selectedYear} onYearChange={handleYearChange} />
            </div>
            <div className="glass rounded-xl p-3">
              <TourSelector selected={selectedTour} onSelect={handleTourChange} />
            </div>
            <div className="glass rounded-xl p-3">
              <CandidateSelector
                candidates={candidates}
                selectedId={selectedCandidate}
                mapMode={mapMode}
                onSelect={handleSelectCandidate}
                onWinnerMode={handleWinnerMode}
              />
            </div>
            <div className="glass rounded-xl p-3">
              <IndicatorSelector selected={indicator} onSelect={setIndicator} />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                Résultats nationaux
              </div>
              <div className="text-xs text-gray-600">
                Présidentielle {selectedYear} · {selectedTour === 1 ? "1er tour" : "2ème tour"}
              </div>
            </div>
            <NationalResults
              results={results}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={handleSelectCandidate}
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">

      {/* ── Navbar ── */}
      <nav className="glass border-b border-white/5 px-3 md:px-4 py-2.5 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          {/* Mobile: bouton contrôles */}
          <button
            className="lg:hidden glass rounded-lg p-1.5 text-gray-400 hover:text-white transition-colors"
            onClick={() => setSheetOpen(true)}
            aria-label="Contrôles"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href={`/${locale}`} className="hover:opacity-80 transition-opacity">
            <span className="text-base font-black gradient-text">ElectionScope</span>
          </Link>
          {loading && (
            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin ml-1" />
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="lg:hidden text-xs text-gray-500 font-medium">
            {selectedYear} · T{selectedTour}
          </span>
          <button
            onClick={() => setShowTimeline((v) => !v)}
            className={`glass rounded-lg px-2 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              showTimeline ? "text-white bg-white/10 ring-1 ring-white/20" : "text-gray-300 hover:text-white"
            }`}
          >
            <span>📈</span>
            <span className="hidden md:inline">Timeline</span>
          </button>
          <span className="text-xs text-gray-600 hidden lg:block">Ministère de l&apos;Intérieur · INSEE</span>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Desktop Sidebar — lg+ only */}
        <motion.aside
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:flex w-[272px] shrink-0 flex-col border-r border-white/5 overflow-hidden"
        >
          {sidebarContent}
        </motion.aside>

        {/* ── Mobile bottom sheet ── */}
        <AnimatePresence>
          {sheetOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setSheetOpen(false)}
              />
              {/* Sheet — monte du bas, max 80vh */}
              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex flex-col bg-[#0d0d14] border-t border-white/10 rounded-t-2xl shadow-2xl"
                style={{ maxHeight: "80vh" }}
              >
                {/* Handle */}
                <div className="shrink-0 pt-3 pb-1 flex flex-col items-center gap-1">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                  <div className="flex items-center justify-between w-full px-4 pb-2 pt-1">
                    <span className="text-sm font-bold text-white">Présidentielle {selectedYear}</span>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="text-gray-500 hover:text-white text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {sidebarContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Content area ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-3 gap-2 md:gap-3">
            {/* Map */}
            <div className="flex-1 min-h-0 relative">
              <ElectionMap
                results={results}
                selectedCandidate={selectedCandidate}
                mapMode={mapMode}
                onDeptClick={setSelectedDept}
              />
              <DeptPanel dept={selectedDept} onClose={() => setSelectedDept(null)} />
            </div>

            {/* Scatter plot — toujours visible */}
            <div className="glass rounded-xl overflow-hidden shrink-0" style={{ height: 180 }}>
              <div className="p-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-1 shrink-0">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Corrélation socio-éco
                  </h2>
                </div>
                <div className="flex-1 min-h-0">
                  {effectiveCandidate && results.length > 0 && (
                    <ScatterPlot
                      results={results}
                      socioeco={socioeco}
                      selectedCandidate={effectiveCandidate}
                      indicator={indicator}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {showTimeline && index && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="shrink-0 border-t border-white/5 glass overflow-hidden"
          >
            <div className="h-full p-3 md:p-4 flex flex-col">
              <TimelineChart index={index} tour={selectedTour} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
