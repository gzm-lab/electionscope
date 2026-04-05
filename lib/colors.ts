// Color utilities for choropleth maps
import * as d3 from "d3";

export function getChoroplethColor(
  value: number,
  min: number,
  max: number,
  baseColor: string
): string {
  const scale = d3
    .scaleSequential()
    .domain([min, max])
    .interpolator(d3.interpolateRgb("#1a1a2e", baseColor));
  return scale(value);
}

export function getPartyGradient(color: string): string[] {
  return [
    d3.color(color)?.copy({ opacity: 0.1 })?.toString() ?? "#1a1a2e",
    d3.color(color)?.copy({ opacity: 0.4 })?.toString() ?? color,
    color,
  ];
}

// Pearson correlation coefficient
export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = d3.mean(xs) ?? 0;
  const my = d3.mean(ys) ?? 0;
  const num = d3.sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
  const den = Math.sqrt(
    d3.sum(xs.map((x) => (x - mx) ** 2)) * d3.sum(ys.map((y) => (y - my) ** 2))
  );
  return den === 0 ? 0 : num / den;
}
