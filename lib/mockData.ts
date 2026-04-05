// Mock data generator for French presidential elections by département
// In production, replace with real data.gouv.fr CSV files

export const DEPARTEMENTS = [
  { code: "01", name: "Ain" }, { code: "02", name: "Aisne" },
  { code: "03", name: "Allier" }, { code: "04", name: "Alpes-de-Haute-Provence" },
  { code: "05", name: "Hautes-Alpes" }, { code: "06", name: "Alpes-Maritimes" },
  { code: "07", name: "Ardèche" }, { code: "08", name: "Ardennes" },
  { code: "09", name: "Ariège" }, { code: "10", name: "Aube" },
  { code: "11", name: "Aude" }, { code: "12", name: "Aveyron" },
  { code: "13", name: "Bouches-du-Rhône" }, { code: "14", name: "Calvados" },
  { code: "15", name: "Cantal" }, { code: "16", name: "Charente" },
  { code: "17", name: "Charente-Maritime" }, { code: "18", name: "Cher" },
  { code: "19", name: "Corrèze" }, { code: "2A", name: "Corse-du-Sud" },
  { code: "2B", name: "Haute-Corse" }, { code: "21", name: "Côte-d'Or" },
  { code: "22", name: "Côtes-d'Armor" }, { code: "23", name: "Creuse" },
  { code: "24", name: "Dordogne" }, { code: "25", name: "Doubs" },
  { code: "26", name: "Drôme" }, { code: "27", name: "Eure" },
  { code: "28", name: "Eure-et-Loir" }, { code: "29", name: "Finistère" },
  { code: "30", name: "Gard" }, { code: "31", name: "Haute-Garonne" },
  { code: "32", name: "Gers" }, { code: "33", name: "Gironde" },
  { code: "34", name: "Hérault" }, { code: "35", name: "Ille-et-Vilaine" },
  { code: "36", name: "Indre" }, { code: "37", name: "Indre-et-Loire" },
  { code: "38", name: "Isère" }, { code: "39", name: "Jura" },
  { code: "40", name: "Landes" }, { code: "41", name: "Loir-et-Cher" },
  { code: "42", name: "Loire" }, { code: "43", name: "Haute-Loire" },
  { code: "44", name: "Loire-Atlantique" }, { code: "45", name: "Loiret" },
  { code: "46", name: "Lot" }, { code: "47", name: "Lot-et-Garonne" },
  { code: "48", name: "Lozère" }, { code: "49", name: "Maine-et-Loire" },
  { code: "50", name: "Manche" }, { code: "51", name: "Marne" },
  { code: "52", name: "Haute-Marne" }, { code: "53", name: "Mayenne" },
  { code: "54", name: "Meurthe-et-Moselle" }, { code: "55", name: "Meuse" },
  { code: "56", name: "Morbihan" }, { code: "57", name: "Moselle" },
  { code: "58", name: "Nièvre" }, { code: "59", name: "Nord" },
  { code: "60", name: "Oise" }, { code: "61", name: "Orne" },
  { code: "62", name: "Pas-de-Calais" }, { code: "63", name: "Puy-de-Dôme" },
  { code: "64", name: "Pyrénées-Atlantiques" }, { code: "65", name: "Hautes-Pyrénées" },
  { code: "66", name: "Pyrénées-Orientales" }, { code: "67", name: "Bas-Rhin" },
  { code: "68", name: "Haut-Rhin" }, { code: "69", name: "Rhône" },
  { code: "70", name: "Haute-Saône" }, { code: "71", name: "Saône-et-Loire" },
  { code: "72", name: "Sarthe" }, { code: "73", name: "Savoie" },
  { code: "74", name: "Haute-Savoie" }, { code: "75", name: "Paris" },
  { code: "76", name: "Seine-Maritime" }, { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" }, { code: "79", name: "Deux-Sèvres" },
  { code: "80", name: "Somme" }, { code: "81", name: "Tarn" },
  { code: "82", name: "Tarn-et-Garonne" }, { code: "83", name: "Var" },
  { code: "84", name: "Vaucluse" }, { code: "85", name: "Vendée" },
  { code: "86", name: "Vienne" }, { code: "87", name: "Haute-Vienne" },
  { code: "88", name: "Vosges" }, { code: "89", name: "Yonne" },
  { code: "90", name: "Territoire de Belfort" }, { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" }, { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" }, { code: "95", name: "Val-d'Oise" },
];

// Seeded random for deterministic mock data
function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

export interface DeptResult {
  code: string;
  name: string;
  candidates: Record<string, number>;
  turnout: number;
  // Socioeconomic indicators
  revenue: number;    // Median income €/month
  unemployment: number; // Unemployment rate %
  poverty: number;    // Poverty rate %
}

export interface ElectionData {
  year: number;
  tour: 1 | 2;
  candidateIds: string[];
  results: DeptResult[];
}

// Generate realistic-looking mock results for a given election
export function generateMockResults(
  year: number,
  tour: 1 | 2,
  candidateIds: string[]
): DeptResult[] {
  const rng = seededRandom(year * 100 + tour * 10);

  return DEPARTEMENTS.map((dept, i) => {
    const deptRng = seededRandom(year * 100 + tour * 10 + i * 7);

    // Generate random percentages that sum to ~100
    const raw = candidateIds.map(() => 5 + deptRng() * 40);
    const total = raw.reduce((a, b) => a + b, 0);
    const normalized = raw.map((v) => Math.round((v / total) * 1000) / 10);

    const candidates: Record<string, number> = {};
    candidateIds.forEach((id, j) => {
      candidates[id] = normalized[j];
    });

    // Socioeconomic mock data with regional variation
    const urbanCoeff = ["75", "69", "13", "33", "67", "31"].includes(dept.code) ? 1.3 : 1.0;
    const ruralCoeff = ["23", "48", "15", "05", "09"].includes(dept.code) ? 0.75 : 1.0;
    const baseRevenue = 1800 + rng() * 800;

    return {
      code: dept.code,
      name: dept.name,
      candidates,
      turnout: Math.round((70 + deptRng() * 20) * 10) / 10,
      revenue: Math.round(baseRevenue * urbanCoeff * ruralCoeff),
      unemployment: Math.round((5 + deptRng() * 15) * 10) / 10,
      poverty: Math.round((8 + deptRng() * 20) * 10) / 10,
    };
  });
}
