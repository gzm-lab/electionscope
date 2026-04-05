"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DeptResult, getCandidateColor } from "@/lib/electionData";
import { pearsonCorrelation } from "@/lib/colors";
import { Indicator } from "@/components/Controls/IndicatorSelector";

interface ScatterPlotProps {
  results: DeptResult[];
  socioeco: Record<string, { revenue: number; unemployment: number; poverty: number }>;
  selectedCandidate: string;
  indicator: Indicator;
}

const INDICATOR_LABELS: Record<Indicator, string> = {
  none: "",
  revenue: "Revenu médian (€/mois)",
  unemployment: "Taux de chômage (%)",
  poverty: "Taux de pauvreté (%)",
};

export default function ScatterPlot({ results, socioeco, selectedCandidate, indicator }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || indicator === "none" || !selectedCandidate) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    if (!container) return;

    const totalWidth = container.clientWidth || 600;
    const totalHeight = container.clientHeight || 300;
    const margin = { top: 16, right: 120, bottom: 52, left: 58 };
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    // Build data — join results with socioeco
    const data = results
      .map((r) => {
        const eco = socioeco[r.code];
        if (!eco) return null;
        const score = r.candidates[selectedCandidate]?.pct ?? 0;
        return { x: eco[indicator as keyof typeof eco] as number, y: score, name: r.name, code: r.code };
      })
      .filter(Boolean) as { x: number; y: number; name: string; code: string }[];

    if (data.length === 0) return;

    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const pearson = pearsonCorrelation(xs, ys);
    const color = getCandidateColor(selectedCandidate);

    const xScale = d3.scaleLinear().domain(d3.extent(xs) as [number, number]).nice().range([0, width]);
    const yScale = d3.scaleLinear().domain([0, (d3.max(ys) ?? 50) * 1.1]).nice().range([height, 0]);

    svg.attr("width", totalWidth).attr("height", totalHeight);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid
    g.append("g")
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
      .attr("transform", `translate(0,${height})`)
      .selectAll("line").attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-dasharray", "3,3");
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ""))
      .selectAll("line").attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-dasharray", "3,3");
    g.selectAll(".domain").remove();

    // Axes
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

    // Axis labels
    g.append("text")
      .attr("x", width / 2).attr("y", height + 42)
      .attr("text-anchor", "middle").attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px")
      .text(INDICATOR_LABELS[indicator]);

    g.append("text")
      .attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -46)
      .attr("text-anchor", "middle").attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px")
      .text(`Score ${selectedCandidate} (%)`);

    // Trend line
    const mx = d3.mean(xs)!;
    const my = d3.mean(ys)!;
    const slope = d3.sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / d3.sum(xs.map((x) => (x - mx) ** 2));
    const intercept = my - slope * mx;
    const [x1, x2] = xScale.domain();

    g.append("line")
      .attr("x1", xScale(x1)).attr("y1", yScale(slope * x1 + intercept))
      .attr("x2", xScale(x2)).attr("y2", yScale(slope * x2 + intercept))
      .attr("stroke", color).attr("stroke-width", 1.5).attr("stroke-dasharray", "6,4").attr("opacity", 0.45);

    // Color scale for dots
    const colorScale = d3.scaleSequential()
      .domain(d3.extent(ys) as [number, number])
      .interpolator(d3.interpolateRgb("rgba(59,130,246,0.2)", color));

    // Dots
    const tooltip = d3.select(tooltipRef.current!);

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", height)
      .attr("r", 0)
      .attr("fill", (d) => colorScale(d.y))
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).raise().attr("r", 7).attr("stroke", "rgba(255,255,255,0.6)").attr("stroke-width", 1.5);
        const svgRect = svgRef.current!.getBoundingClientRect();
        const cx = +d3.select(this).attr("cx") + margin.left;
        const cy = +d3.select(this).attr("cy") + margin.top;
        tooltip
          .style("display", "block")
          .style("left", `${cx + 10}px`)
          .style("top", `${cy - 50}px`)
          .html(`
            <div class="font-semibold text-white text-xs mb-1">${d.name}</div>
            <div class="text-xs" style="color:${color}">${selectedCandidate}: <strong>${d.y.toFixed(1)}%</strong></div>
            <div class="text-xs text-gray-400">${INDICATOR_LABELS[indicator].split(" (")[0]}: ${
              indicator === "revenue" ? `${d.x.toLocaleString("fr-FR")} €` : `${d.x}%`
            }</div>
          `);
      })
      .on("mousemove", function (event) {
        const svgRect = svgRef.current!.getBoundingClientRect();
        const cx = +d3.select(this).attr("cx") + margin.left;
        const cy = +d3.select(this).attr("cy") + margin.top;
        tooltip.style("left", `${cx + 10}px`).style("top", `${cy - 60}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 0.8);
        tooltip.style("display", "none");
      })
      .transition().duration(500).delay((_, i) => i * 6).ease(d3.easeCubicOut)
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5);

    // Pearson badge
    const pearsonG = g.append("g").attr("transform", `translate(${width + 8}, 8)`);
    pearsonG.append("rect")
      .attr("width", 100).attr("height", 44).attr("rx", 8)
      .attr("fill", "rgba(10,10,20,0.9)").attr("stroke", "rgba(59,130,246,0.2)").attr("stroke-width", 1);
    pearsonG.append("text")
      .attr("x", 50).attr("y", 16).attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.4)").style("font-size", "9px").text("Pearson r");
    pearsonG.append("text")
      .attr("x", 50).attr("y", 34).attr("text-anchor", "middle")
      .attr("fill", pearson > 0 ? "#10b981" : "#ef4444")
      .style("font-size", "15px").style("font-weight", "bold")
      .text(pearson.toFixed(3));

  }, [results, socioeco, selectedCandidate, indicator]);

  if (indicator === "none") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
        <div className="text-2xl opacity-30">📊</div>
        <p className="text-gray-600 text-sm">Sélectionnez un indicateur socio-économique</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none map-tooltip z-30 text-xs"
        style={{ minWidth: 140 }}
      />
    </div>
  );
}
