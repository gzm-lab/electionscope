// Real election data loader from /public/data/*.json
// Data based on real national results (Ministère de l'Intérieur)
// with realistic regional distribution

export interface CandidateResult {
  votes: number;
  pct: number;
}

export interface DeptResult {
  code: string;
  name: string;
  inscrits: number;
  votants: number;
  exprimes: number;
  turnout: number;
  candidates: Record<string, CandidateResult>;
}

export interface ElectionIndex {
  elections: {
    year: number;
    tours: number[];
    candidates_t1: string[];
    candidates_t2: string[];
    national_t1: Record<string, number>;
    national_t2: Record<string, number>;
  }[];
}

// Cache
const cache: Record<string, DeptResult[]> = {};
let indexCache: ElectionIndex | null = null;

export async function loadIndex(): Promise<ElectionIndex> {
  if (indexCache) return indexCache;
  const res = await fetch("/data/index.json");
  indexCache = await res.json();
  return indexCache!;
}

export async function loadElectionResults(
  year: number,
  tour: 1 | 2
): Promise<DeptResult[]> {
  const key = `${year}-t${tour}`;
  if (cache[key]) return cache[key];
  const res = await fetch(`/data/${key}.json`);
  const data = await res.json();
  cache[key] = data;
  return data;
}

// Candidate color palette — consistent across years for same political family
export const CANDIDATE_COLORS: Record<string, string> = {
  // Left / PS
  "Mitterrand": "#e11d48",
  "Jospin": "#e11d48",
  "Hollande": "#e11d48",
  "Royal": "#e11d48",
  "Hamon": "#e11d48",
  // Hard left / PCF
  "Marchais": "#b91c1c",
  "Lajoinie": "#b91c1c",
  "Hue": "#b91c1c",
  "Arlette": "#b91c1c",
  "Besancenot": "#7c2d12",
  "Mélenchon": "#7c3aed",
  // Green
  "Mamère": "#16a34a",
  "Jadot": "#16a34a",
  "Lalonde": "#16a34a",
  // Center
  "Lecanuet": "#d97706",
  "Poher": "#d97706",
  "Barre": "#d97706",
  "Bayrou": "#d97706",
  "Macron": "#2563eb",
  "Royer": "#d97706",
  "Chevènement": "#d97706",
  "Defferre": "#d97706",
  // Right / RPR / UMP / LR
  "de Gaulle": "#1e40af",
  "Pompidou": "#1e40af",
  "Giscard": "#1e40af",
  "Chirac": "#1e40af",
  "Balladur": "#1e40af",
  "Chaban-Delmas": "#1e40af",
  "Sarkozy": "#1e40af",
  "Fillon": "#1e40af",
  "Pécresse": "#1e40af",
  // FN / RN
  "Le Pen": "#b45309",
  "Tixier-Vignancour": "#b45309",
  "Zemmour": "#dc2626",
  // Misc
  "Autres": "#6b7280",
};

export function getCandidateColor(name: string): string {
  return CANDIDATE_COLORS[name] ?? "#6b7280";
}

// Get winner per department
export function getWinnerMap(results: DeptResult[]): Record<string, { name: string; pct: number }> {
  const map: Record<string, { name: string; pct: number }> = {};
  for (const dept of results) {
    let best = "";
    let bestPct = 0;
    for (const [name, res] of Object.entries(dept.candidates)) {
      if (res.pct > bestPct) {
        bestPct = res.pct;
        best = name;
      }
    }
    map[dept.code] = { name: best, pct: bestPct };
  }
  return map;
}

// Compute national aggregate from department results
export function computeNational(
  results: DeptResult[]
): Record<string, { votes: number; pct: number }> {
  const totals: Record<string, number> = {};
  let totalExprimes = 0;
  for (const dept of results) {
    totalExprimes += dept.exprimes;
    for (const [name, res] of Object.entries(dept.candidates)) {
      totals[name] = (totals[name] ?? 0) + res.votes;
    }
  }
  const out: Record<string, { votes: number; pct: number }> = {};
  for (const [name, votes] of Object.entries(totals)) {
    out[name] = { votes, pct: Math.round((votes / totalExprimes) * 1000) / 10 };
  }
  return out;
}
