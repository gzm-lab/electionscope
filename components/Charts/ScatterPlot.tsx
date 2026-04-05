"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DeptResult } from "@/lib/mockData";
import { Candidate } from "@/lib/elections";
import { pearsonCorrelation } from "@/lib/colors";
import { Indicator } from "@/components/Controls/IndicatorSelector";
import { useTranslations } from "next-intl";

interface ScatterPlotProps {
  results: DeptResult[];
  selectedCandidateId: string;
  candidate: Candidate;
  indicator: Indicator;
}

const INDICATOR_LABELS: Record<string, string> = {
  revenue: "Revenu médian (€/mois)",
  unemployment: "Taux de chômage (%)",
  poverty: "Taux de pauvreté (%)",
};

export default function ScatterPlot({
  results,
  selectedCandidateId,
  candidate,
  indicator,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const t = useTranslations("explore");

  useEffect(() => {
    if (!svgRef.current || indicator === "none") return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    if (!container) return;

    const totalWidth = container.clientWidth || 600;
    const totalHeight = container.clientHeight || 320;
    const margin = { top: 20, right: 30, bottom: 50, left: 55 };
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    const data = results.map((r) => ({
      x: r[indicator as keyof DeptResult] as number,
      y: r.candidates[selectedCandidateId] ?? 0,
      name: r.name,
    }));

    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const pearson = pearsonCorrelation(xs, ys);

    const xScale = d3.scaleLinear().domain(d3.extent(xs) as [number, number]).nice().range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(ys) as number]).nice().range([height, 0]);

    svg
      .attr("width", totalWidth)
      .attr("height", totalHeight);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale).tickSize(-height).tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(255,255,255,0.04)")
      .attr("stroke-dasharray", "3,3");

    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale).tickSize(-width).tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(255,255,255,0.04)")
      .attr("stroke-dasharray", "3,3");

    // Remove axis domains
    g.selectAll(".grid .domain").remove();

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text, line, path")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("fill", "rgba(255,255,255,0.4)")
      .style("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll("text, line, path")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("fill", "rgba(255,255,255,0.4)")
      .style("font-size", "11px");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.4)")
      .style("font-size", "11px")
      .text(INDICATOR_LABELS[indicator]);

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -42)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.4)")
      .style("font-size", "11px")
      .text(`Score ${candidate.name.split(" ").slice(-1)[0]} (%)`);

    // Trend line (linear regression)
    const mx = d3.mean(xs)!;
    const my = d3.mean(ys)!;
    const slope = d3.sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / d3.sum(xs.map((x) => (x - mx) ** 2));
    const intercept = my - slope * mx;
    const linReg = { slope, intercept };

    if (linReg) {
      const x1 = xScale.domain()[0];
      const x2 = xScale.domain()[1];
      const y1 = linReg.slope * x1 + linReg.intercept;
      const y2 = linReg.slope * x2 + linReg.intercept;

      g.append("line")
        .attr("x1", xScale(x1)).attr("y1", yScale(y1))
        .attr("x2", xScale(x2)).attr("y2", yScale(y2))
        .attr("stroke", candidate.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6,4")
        .attr("opacity", 0.5);
    }

    // Dots
    const colorScale = d3
      .scaleSequential()
      .domain(d3.extent(ys) as [number, number])
      .interpolator(d3.interpolateRgb("rgba(59,130,246,0.3)", candidate.color));

    const dots = g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", height) // Start at bottom for animation
      .attr("r", 0)
      .attr("fill", (d) => colorScale(d.y))
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer");

    // Animate in
    dots
      .transition()
      .duration(600)
      .delay((_, i) => i * 8)
      .ease(d3.easeCubicOut)
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5);

    // Tooltip on hover
    const tooltip = d3.select("body").select(".scatter-tooltip");

    dots
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("stroke-width", 0.5);
      });

    // Pearson badge
    const pearsonGroup = g.append("g").attr("transform", `translate(${width - 10}, 10)`);

    pearsonGroup
      .append("rect")
      .attr("x", -120).attr("y", -5)
      .attr("width", 130).attr("height", 36)
      .attr("rx", 8)
      .attr("fill", "rgba(13,13,25,0.8)")
      .attr("stroke", "rgba(59,130,246,0.2)")
      .attr("stroke-width", 1);

    pearsonGroup
      .append("text")
      .attr("x", -55).attr("y", 8)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.5)")
      .style("font-size", "10px")
      .text("Pearson r");

    pearsonGroup
      .append("text")
      .attr("x", -55).attr("y", 24)
      .attr("text-anchor", "middle")
      .attr("fill", pearson > 0 ? "#10b981" : "#ef4444")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(pearson.toFixed(3));

  }, [results, selectedCandidateId, candidate, indicator]);

  if (indicator === "none") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Sélectionnez un indicateur socio-économique</p>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}
