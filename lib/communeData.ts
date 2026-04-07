// Loader pour les données communes
// Résultats : { "01001": { "MACRON Emmanuel": { pct: 28.85, voix: 150 } } }
// Socioéco  : { "01001": { revenue: 2068, poverty: null, ... } }

export interface CommuneResult {
  [candidateName: string]: { pct: number; voix: number };
}

export interface CommuneSocioEco {
  revenue: number | null;
  poverty: number | null;
  unemployment: number | null;
  medecins_per_100k: number;
  pharmacies_per_100k: number;
  fast_food_per_100k: number;
  rugby_clubs_per_100k: number;
}

const elecCache: Record<string, Record<string, CommuneResult>> = {};
let socioCache: Record<string, CommuneSocioEco> | null = null;

export async function loadCommuneResults(
  year: number,
  tour: 1 | 2
): Promise<Record<string, CommuneResult>> {
  const key = `${year}-t${tour}`;
  if (elecCache[key]) return elecCache[key];
  const res = await fetch(`/data/communes/${key}.json`);
  const data = await res.json();
  elecCache[key] = data;
  return data;
}

export async function loadCommuneSocioEco(): Promise<Record<string, CommuneSocioEco>> {
  if (socioCache) return socioCache;
  const res = await fetch("/data/socioeco_communes.json");
  socioCache = await res.json();
  return socioCache!;
}

// Retourne le candidat en tête dans une commune
export function getCommuneWinner(
  communeResult: CommuneResult
): { name: string; pct: number } | null {
  let best = "";
  let bestPct = 0;
  for (const [name, { pct }] of Object.entries(communeResult)) {
    if (pct > bestPct) { bestPct = pct; best = name; }
  }
  return best ? { name: best, pct: bestPct } : null;
}
