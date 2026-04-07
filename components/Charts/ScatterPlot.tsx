"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DeptResult, getCandidateColor } from "@/lib/electionData";
import { pearsonCorrelation } from "@/lib/colors";
import { Indicator } from "@/components/Controls/IndicatorSelector";

interface ScatterPlotProps {
  results: DeptResult[];
  socioeco: Record<string, Record<string, number>>;
  selectedCandidate: string | null;
  indicator: Indicator;
  communeElec?: Record<string, any>;
  communeSocio?: Record<string, any>;
  communeNames?: Record<string, string>;
  selectedDeptCode?: string | null;
}

const INDICATOR_LABELS: Record<Indicator, string> = {
  revenue:              "Revenu médian (€/mois)",
  unemployment:         "Taux de chômage (%)",
  poverty:              "Taux de pauvreté (%)",
  medecins_per_100k:    "Médecins / 100k hab.",
  pharmacies_per_100k:  "Pharmacies / 100k hab.",
  sau_pct:              "Surface agricole (%)",
  chasse_per_100k:      "Tableaux de chasse / 100k",
  lieux_culte_per_100k: "Lieux de culte / 100k",
  rugby_clubs_per_100k: "Clubs de rugby / 100k",
  fast_food_per_100k:   "Fast-foods / 100k hab.",
  ensoleillement_h:     "Ensoleillement (h/an)",
};

const INDICATOR_FORMAT: Record<Indicator, (v: number) => string> = {
  revenue:              (v) => `${v.toLocaleString("fr-FR")} €`,
  unemployment:         (v) => `${v.toFixed(1)} %`,
  poverty:              (v) => `${v.toFixed(1)} %`,
  medecins_per_100k:    (v) => `${v.toFixed(1)}`,
  pharmacies_per_100k:  (v) => `${v.toFixed(1)}`,
  sau_pct:              (v) => `${v.toFixed(1)} %`,
  chasse_per_100k:      (v) => `${v.toFixed(0)}`,
  lieux_culte_per_100k: (v) => `${v.toFixed(1)}`,
  rugby_clubs_per_100k: (v) => `${v.toFixed(1)}`,
  fast_food_per_100k:   (v) => `${v.toFixed(0)}`,
  ensoleillement_h:     (v) => `${v.toFixed(0)} h`,
};

export default function ScatterPlot({ results, socioeco, selectedCandidate, indicator, communeElec, communeSocio, communeNames, selectedDeptCode }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !svgRef.current || !selectedCandidate) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const totalWidth = container.clientWidth || 600;
    const totalHeight = container.clientHeight || 300;
    const margin = { top: 16, right: 128, bottom: 52, left: 58 };
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let data: { x: number; y: number; name: string; code: string }[] = [];

    // Mode Département (communes d'un dept) ou France entière (toutes les communes)
    // if communeElec est vide ({}), on ne doit pas entrer dans ce bloc pour ne pas afficher 0 points !
    const hasCommuneData = communeElec && Object.keys(communeElec).length > 0 && communeSocio && Object.keys(communeSocio).length > 0;
    console.log("hasCommuneData:", hasCommuneData, "communeElec keys:", communeElec ? Object.keys(communeElec).length : 0, "communeSocio keys:", communeSocio ? Object.keys(communeSocio).length : 0);

    
    if (hasCommuneData) {
      const targetCodes = selectedDeptCode 
        ? Object.keys(communeElec).filter(c => c.startsWith(selectedDeptCode))
        : Object.keys(communeElec);
        
      data = targetCodes.map(code => {
        const cElec = communeElec[code];
        const cSocio = communeSocio[code];
        if (!cElec || !cSocio || cSocio[indicator as keyof typeof cSocio] === null || cSocio[indicator as keyof typeof cSocio] === undefined) return null;
        
        // On récupère le score (avec le matcher intelligent "Macron" dans "MACRON Emmanuel")
        const candKey = Object.keys(cElec).find(k => k.toLowerCase().includes(selectedCandidate.toLowerCase()));
        if (!candKey) return null;
        
        const score = cElec[candKey].pct;
        const valX = cSocio[indicator as keyof typeof cSocio] as number;
        // Pour les communes, on a le code, mais pas le nom exact dans elecCache/socioCache
        // On utilise communeNames s'il est dispo, sinon on affiche le code
        const name = communeNames?.[code] || "Commune " + code;
        return { x: valX, y: score, name, code };
      }).filter(Boolean) as { x: number; y: number; name: string; code: string }[];
    } else {
      // Mode Départements "classique" (fallback)
      console.warn("ScatterPlot in FALLBACK mode. hasCommuneData was false.");
      data = results
        .map((r) => {
          const eco = socioeco[r.code];
          if (!eco) return null;
          const score = r.candidates[selectedCandidate]?.pct ?? 0;
          return { x: eco[indicator as keyof typeof eco] as number, y: score, name: r.name, code: r.code };
        })
        .filter(Boolean) as { x: number; y: number; name: string; code: string }[];
    }

    if (data.length === 0) return;

    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const pearson = pearsonCorrelation(xs, ys);
    const color = getCandidateColor(selectedCandidate);

    const xScale = d3.scaleLinear().domain(d3.extent(xs) as [number, number]).nice().range([0, width]);
    const yScale = d3.scaleLinear().domain([0, (d3.max(ys) ?? 50) * 1.1]).nice().range([height, 0]);

    svg.attr("width", totalWidth).attr("height", totalHeight);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
      .attr("transform", `translate(0,${height})`)
      .selectAll("line").attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-dasharray", "3,3");
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ""))
      .selectAll("line").attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-dasharray", "3,3");
    g.selectAll(".domain").remove();

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call(ax => ax.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call(ax => ax.selectAll("text").attr("fill", "rgba(255,255,255,0.35)").style("font-size", "10px"))
      .call(ax => ax.selectAll(".tick line").attr("stroke", "none"));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`))
      .call(ax => ax.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call(ax => ax.selectAll("text").attr("fill", "rgba(255,255,255,0.35)").style("font-size", "10px"))
      .call(ax => ax.selectAll(".tick line").attr("stroke", "none"));

    g.append("text")
      .attr("x", width / 2).attr("y", height + 42)
      .attr("text-anchor", "middle").attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px")
      .text(INDICATOR_LABELS[indicator]);

    g.append("text")
      .attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -46)
      .attr("text-anchor", "middle").attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px")
      .text(`Score ${selectedCandidate} (%)`);

    const mx = d3.mean(xs)!;
    const my = d3.mean(ys)!;
    const slope = d3.sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / d3.sum(xs.map((x) => (x - mx) ** 2));
    const intercept = my - slope * mx;
    const [x1, x2] = xScale.domain();

    g.append("line")
      .attr("x1", xScale(x1)).attr("y1", yScale(slope * x1 + intercept))
      .attr("x2", xScale(x2)).attr("y2", yScale(slope * x2 + intercept))
      .attr("stroke", color).attr("stroke-width", 1.5).attr("stroke-dasharray", "6,4").attr("opacity", 0.45);

    const colorScale = d3.scaleSequential()
      .domain(d3.extent(ys) as [number, number])
      .interpolator(d3.interpolateRgb("rgba(59,130,246,0.2)", color));

    ctx.clearRect(0, 0, totalWidth, totalHeight);
    const radius = 3;
    
    const drawPoints = (hoverIndex: number | null) => {
      ctx.clearRect(0, 0, totalWidth, totalHeight);
      data.forEach((d, i) => {
        if (i === hoverIndex) return;
        const cx = margin.left + xScale(d.x);
        const cy = margin.top + yScale(d.y);
        ctx.beginPath();
        
        // Si plus de 1000 points, c'est les communes : on dessine un petit cercle sans stroke car ça rend un paté
        if (data.length > 1000) {
            ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = colorScale(d.y).replace(')', ', 0.8)').replace('rgb', 'rgba');
            ctx.fill();
        } else {
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.fillStyle = colorScale(d.y);
            ctx.fill();
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();
        }
      });

      if (hoverIndex !== null) {
        const d = data[hoverIndex];
        const cx = margin.left + xScale(d.x);
        const cy = margin.top + yScale(d.y);
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = colorScale(d.y);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.stroke();
      }
    };

    drawPoints(null);

    const delaunay = d3.Delaunay.from(data, d => xScale(d.x), d => yScale(d.y));
    const tooltip = d3.select(tooltipRef.current!);
    
    svg.on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event);
      const x = mx - margin.left;
      const y = my - margin.top;
      
      if (x < 0 || x > width || y < 0 || y > height) {
        tooltip.style("display", "none");
        drawPoints(null);
        return;
      }

      const index = delaunay.find(x, y);
      if (index !== null) {
        const d = data[index];
        const dist = Math.sqrt(Math.pow(x - xScale(d.x), 2) + Math.pow(y - yScale(d.y), 2));
        if (dist > 30) {
          tooltip.style("display", "none");
          drawPoints(null);
          return;
        }

        drawPoints(index);

        const cx = margin.left + xScale(d.x);
        const cy = margin.top + yScale(d.y);
        tooltip
          .style("display", "block")
          .style("left", `${cx + 10}px`)
          .style("top", `${cy - 50}px`)
          .html(`
            <div class="font-semibold text-white text-xs mb-1">${d.name}</div>
            <div class="text-xs" style="color:${color}">${selectedCandidate}: <strong>${d.y.toFixed(1)}%</strong></div>
            <div class="text-xs text-gray-400">${INDICATOR_LABELS[indicator].split(" (")[0]}: ${INDICATOR_FORMAT[indicator](d.x)}</div>
          `);
      }
    });
    
    svg.on("mouseleave", () => {
      tooltip.style("display", "none");
      drawPoints(null);
    });

    const absR = Math.abs(pearson);
    const pearsonColor = absR < 0.1 ? "#6b7280" : absR < 0.3 ? "#f59e0b" : absR < 0.5 ? "#f97316" : "#10b981";
    const pearsonLabel = absR < 0.1 ? "Pas de corr." : absR < 0.3 ? "Corr. faible" : absR < 0.5 ? "Corr. modérée" : "Corr. forte";
    const pearsonSign = pearson >= 0 ? "↗ positive" : "↘ négative";

    const pearsonG = g.append("g").attr("transform", `translate(${width + 8}, 0)`);
    pearsonG.append("rect")
      .attr("width", 108).attr("height", 72).attr("rx", 8)
      .attr("fill", "rgba(10,10,20,0.95)")
      .attr("stroke", pearsonColor)
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.5);
    
    pearsonG.append("text")
      .attr("x", 54).attr("y", 14).attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.35)").style("font-size", "8px").style("letter-spacing", "0.05em")
      .text("PEARSON r");
      
    pearsonG.append("text")
      .attr("x", 54).attr("y", 34).attr("text-anchor", "middle")
      .attr("fill", pearsonColor)
      .style("font-size", "16px").style("font-weight", "bold")
      .text(pearson.toFixed(3));
      
    pearsonG.append("text")
      .attr("x", 54).attr("y", 50).attr("text-anchor", "middle")
      .attr("fill", pearsonColor).style("font-size", "8px").style("font-weight", "600")
      .text(pearsonLabel);
      
    pearsonG.append("text")
      .attr("x", 54).attr("y", 64).attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.25)").style("font-size", "8px")
      .text(pearsonSign);

  }, [results, socioeco, selectedCandidate, indicator, communeElec, communeSocio, communeNames, selectedDeptCode]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
      <svg ref={svgRef} className="absolute inset-0 w-full h-full z-20 pointer-events-auto" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none map-tooltip z-30 text-xs"
        style={{ minWidth: 140 }}
      />
    </div>
  );
}
