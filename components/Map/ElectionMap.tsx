"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { DeptResult, getCandidateColor, getWinnerMap } from "@/lib/electionData";

interface ElectionMapProps {
  results: DeptResult[];
  selectedCandidate: string | null; // null = winner mode
  mapMode: "candidate" | "winner";
  onDeptClick: (dept: DeptResult) => void;
}

interface TooltipData {
  x: number;
  y: number;
  dept: DeptResult;
}

export default function ElectionMap({
  results,
  selectedCandidate,
  mapMode,
  onDeptClick,
}: ElectionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const resultsMapRef = useRef<Record<string, DeptResult>>({});

  useEffect(() => {
    resultsMapRef.current = Object.fromEntries(results.map((r) => [r.code, r]));
  }, [results]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: {
          version: 8,
          sources: {},
          layers: [{ id: "background", type: "background", paint: { "background-color": "#0a0a0f" } }],
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        },
        center: [2.3, 46.5],
        zoom: 4.8,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });

      mapInstance.current = map;

      map.on("load", async () => {
        const res = await fetch("/data/departements-simplifie.geojson");
        const geojson = await res.json();

        map.addSource("departments", { type: "geojson", data: geojson });

        map.addLayer({
          id: "departments-fill",
          type: "fill",
          source: "departments",
          paint: { "fill-color": "#1a1a2e", "fill-opacity": 0.9 },
        });

        map.addLayer({
          id: "departments-hover",
          type: "fill",
          source: "departments",
          paint: { "fill-color": "#ffffff", "fill-opacity": 0 },
        });

        map.addLayer({
          id: "departments-border",
          type: "line",
          source: "departments",
          paint: { "line-color": "#0a0a0f", "line-width": 0.8 },
        });

        map.addLayer({
          id: "departments-border-hover",
          type: "line",
          source: "departments",
          filter: ["==", "code", ""],
          paint: { "line-color": "#ffffff", "line-width": 2, "line-opacity": 0.6 },
        });

        // Mouse events
        map.on("mousemove", "departments-fill", (e) => {
          if (!e.features?.length) return;
          const code = e.features[0].properties?.code;
          const dept = resultsMapRef.current[code];
          if (!dept) return;

          map.getCanvas().style.cursor = "pointer";
          map.setFilter("departments-border-hover", ["==", "code", code]);
          setTooltip({ x: e.point.x, y: e.point.y, dept });
        });

        map.on("mouseleave", "departments-fill", () => {
          map.getCanvas().style.cursor = "";
          map.setFilter("departments-border-hover", ["==", "code", ""]);
          setTooltip(null);
        });

        map.on("click", "departments-fill", (e) => {
          if (!e.features?.length) return;
          const code = e.features[0].properties?.code;
          const dept = resultsMapRef.current[code];
          if (dept) onDeptClick(dept);
        });

        setMapReady(true);
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update colors when data/mode/candidate changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady || results.length === 0) return;

    const colorExpr: any[] = ["match", ["get", "code"]];

    if (mapMode === "winner") {
      const winnerMap = getWinnerMap(results);
      for (const [code, { name }] of Object.entries(winnerMap)) {
        colorExpr.push(code, getCandidateColor(name));
      }
    } else if (selectedCandidate) {
      const scores = results.map((r) => r.candidates[selectedCandidate]?.pct ?? 0);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const baseColor = getCandidateColor(selectedCandidate);

      const colorScale = d3
        .scaleSequential()
        .domain([minScore, maxScore])
        .interpolator(d3.interpolateRgb("#0f0f1a", baseColor));

      for (const dept of results) {
        const score = dept.candidates[selectedCandidate]?.pct ?? 0;
        colorExpr.push(dept.code, colorScale(score));
      }
    }

    colorExpr.push("#1a1a2e");

    if (map.getLayer("departments-fill")) {
      map.setPaintProperty("departments-fill", "fill-color", colorExpr);
    }
  }, [results, selectedCandidate, mapMode, mapReady]);

  // Determine winner for tooltip
  const getLeader = (dept: DeptResult) => {
    let best = "";
    let bestPct = 0;
    for (const [name, res] of Object.entries(dept.candidates)) {
      if (res.pct > bestPct) { bestPct = res.pct; best = name; }
    }
    return { name: best, pct: bestPct };
  };

  const tooltipColor = tooltip
    ? mapMode === "winner"
      ? getCandidateColor(getLeader(tooltip.dept).name)
      : selectedCandidate
      ? getCandidateColor(selectedCandidate)
      : "#3b82f6"
    : "#3b82f6";

  const tooltipScore = tooltip
    ? mapMode === "winner"
      ? getLeader(tooltip.dept).pct
      : tooltip.dept.candidates[selectedCandidate ?? ""]?.pct ?? 0
    : 0;

  const tooltipName = tooltip
    ? mapMode === "winner"
      ? getLeader(tooltip.dept).name
      : selectedCandidate ?? ""
    : "";

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/5" />

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            className="absolute pointer-events-none z-20 map-tooltip min-w-[180px]"
            style={{
              left: tooltip.x > (mapRef.current?.clientWidth ?? 800) - 220 ? tooltip.x - 200 : tooltip.x + 14,
              top: tooltip.y > 150 ? tooltip.y - 130 : tooltip.y + 14,
            }}
          >
            <div className="font-bold text-white text-sm mb-2.5">{tooltip.dept.name}</div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tooltipColor }} />
              <span className="text-gray-300 text-xs font-medium">{tooltipName}</span>
              <span className="ml-auto text-base font-black" style={{ color: tooltipColor }}>
                {tooltipScore.toFixed(1)}%
              </span>
            </div>
            {mapMode === "winner" && (
              <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                {Object.entries(tooltip.dept.candidates)
                  .sort((a, b) => b[1].pct - a[1].pct)
                  .slice(0, 4)
                  .map(([name, res]) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getCandidateColor(name) }} />
                      <span className="text-gray-500 text-xs truncate max-w-[90px]">{name}</span>
                      <span className="ml-auto text-xs text-gray-300 font-semibold">{res.pct.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-500 flex justify-between">
              <span>Participation</span>
              <span className="text-gray-400 font-semibold">{tooltip.dept.turnout}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 max-w-[200px]">
        {mapMode === "winner" ? (
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">Candidat en tête</div>
            <div className="space-y-1">
              {Array.from(new Set(results.map(r => {
                let best = ""; let bestPct = 0;
                for (const [n, v] of Object.entries(r.candidates)) if (v.pct > bestPct) { bestPct = v.pct; best = n; }
                return best;
              }))).filter(Boolean).map(name => (
                <div key={name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: getCandidateColor(name) }} />
                  <span className="text-xs text-gray-400 truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : selectedCandidate ? (
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">{selectedCandidate}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">0%</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: `linear-gradient(to right, #0f0f1a, ${getCandidateColor(selectedCandidate)})` }} />
              <span className="text-xs text-gray-500">max</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Loading */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] rounded-xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Chargement de la carte…</p>
          </div>
        </div>
      )}
    </div>
  );
}
