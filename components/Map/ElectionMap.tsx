"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { DeptResult } from "@/lib/mockData";
import { Candidate } from "@/lib/elections";

interface ElectionMapProps {
  results: DeptResult[];
  selectedCandidateId: string;
  candidate: Candidate;
}

interface TooltipData {
  x: number;
  y: number;
  dept: DeptResult;
  score: number;
}

export default function ElectionMap({ results, selectedCandidateId, candidate }: ElectionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const resultsMap = Object.fromEntries(results.map((r) => [r.code, r]));

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "background",
              type: "background",
              paint: { "background-color": "#0a0a0f" },
            },
          ],
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        },
        center: [2.3, 46.5],
        zoom: 4.8,
        attributionControl: false,
        pitchWithRotate: false,
      });

      mapInstance.current = map;

      map.on("load", async () => {
        // Load France departments GeoJSON
        const res = await fetch(
          "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson"
        );
        const geojson = await res.json();

        map.addSource("departments", {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: "departments-fill",
          type: "fill",
          source: "departments",
          paint: {
            "fill-color": "#1a1a2e",
            "fill-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "departments-border",
          type: "line",
          source: "departments",
          paint: {
            "line-color": "#252540",
            "line-width": 0.8,
          },
        });

        // Hover highlight
        let hoveredId: string | null = null;

        map.on("mousemove", "departments-fill", (e) => {
          if (!e.features || e.features.length === 0) return;
          const feature = e.features[0];
          const code = feature.properties?.code;
          const dept = resultsMap[code];
          if (!dept) return;

          map.getCanvas().style.cursor = "pointer";

          if (hoveredId !== code) {
            hoveredId = code;
            const score = dept.candidates[selectedCandidateId] ?? 0;
            setTooltip({
              x: e.point.x,
              y: e.point.y,
              dept,
              score,
            });
          }
        });

        map.on("mouseleave", "departments-fill", () => {
          map.getCanvas().style.cursor = "";
          hoveredId = null;
          setTooltip(null);
        });

        setMapReady(true);
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update colors when candidate/results change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    const scores = results.map((r) => r.candidates[selectedCandidateId] ?? 0);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    const colorScale = d3
      .scaleSequential()
      .domain([minScore, maxScore])
      .interpolator(d3.interpolateRgb("#1a1a2e", candidate.color));

    // Build color expression for MapLibre
    const colorExpr: any[] = ["match", ["get", "code"]];

    results.forEach((dept) => {
      const score = dept.candidates[selectedCandidateId] ?? 0;
      colorExpr.push(dept.code, colorScale(score));
    });

    colorExpr.push("#1a1a2e"); // default

    if (map.getLayer("departments-fill")) {
      map.setPaintProperty("departments-fill", "fill-color", colorExpr);
    }
  }, [results, selectedCandidateId, candidate, mapReady]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map overlay gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/5" />

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="absolute pointer-events-none map-tooltip z-10"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 60,
              transform: tooltip.x > 600 ? "translateX(-110%)" : undefined,
            }}
          >
            <div className="font-semibold text-white text-sm mb-2">{tooltip.dept.name}</div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: candidate.color }}
              />
              <span className="text-gray-400 text-xs">{candidate.name}</span>
            </div>
            <div
              className="text-2xl font-black mb-1"
              style={{ color: candidate.color }}
            >
              {tooltip.score.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              Participation : {tooltip.dept.turnout}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-2 font-medium">Score {candidate.name.split(" ").slice(-1)[0]}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Faible</span>
          <div
            className="w-24 h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, #1a1a2e, ${candidate.color})`,
            }}
          />
          <span className="text-xs text-gray-500">Fort</span>
        </div>
      </div>

      {/* Loading overlay */}
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
