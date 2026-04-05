// Election years and candidates data
export const ELECTIONS = [
  {
    year: 1965,
    candidates: [
      { id: "degaulle", name: "Charles de Gaulle", party: "UNR", color: "#1d4ed8" },
      { id: "mitterrand", name: "François Mitterrand", party: "FGDS", color: "#dc2626" },
      { id: "lecanuet", name: "Jean Lecanuet", party: "MRP", color: "#16a34a" },
    ],
  },
  {
    year: 1969,
    candidates: [
      { id: "pompidou", name: "Georges Pompidou", party: "UDR", color: "#1d4ed8" },
      { id: "poher", name: "Alain Poher", party: "CD", color: "#d97706" },
      { id: "duclos", name: "Jacques Duclos", party: "PCF", color: "#dc2626" },
    ],
  },
  {
    year: 1974,
    candidates: [
      { id: "giscard", name: "Valéry Giscard d'Estaing", party: "RI", color: "#1d4ed8" },
      { id: "mitterrand74", name: "François Mitterrand", party: "PS", color: "#dc2626" },
      { id: "chaban", name: "Jacques Chaban-Delmas", party: "UDR", color: "#7c3aed" },
    ],
  },
  {
    year: 1981,
    candidates: [
      { id: "mitterrand81", name: "François Mitterrand", party: "PS", color: "#dc2626" },
      { id: "giscard81", name: "Valéry Giscard d'Estaing", party: "UDF", color: "#1d4ed8" },
      { id: "chirac81", name: "Jacques Chirac", party: "RPR", color: "#7c3aed" },
    ],
  },
  {
    year: 1988,
    candidates: [
      { id: "mitterrand88", name: "François Mitterrand", party: "PS", color: "#dc2626" },
      { id: "chirac88", name: "Jacques Chirac", party: "RPR", color: "#1d4ed8" },
      { id: "barre", name: "Raymond Barre", party: "UDF", color: "#d97706" },
      { id: "lepen88", name: "Jean-Marie Le Pen", party: "FN", color: "#b45309" },
    ],
  },
  {
    year: 1995,
    candidates: [
      { id: "chirac95", name: "Jacques Chirac", party: "RPR", color: "#1d4ed8" },
      { id: "jospin", name: "Lionel Jospin", party: "PS", color: "#dc2626" },
      { id: "balladur", name: "Édouard Balladur", party: "RPR", color: "#7c3aed" },
      { id: "lepen95", name: "Jean-Marie Le Pen", party: "FN", color: "#b45309" },
    ],
  },
  {
    year: 2002,
    candidates: [
      { id: "chirac02", name: "Jacques Chirac", party: "RPR", color: "#1d4ed8" },
      { id: "lepen02", name: "Jean-Marie Le Pen", party: "FN", color: "#b45309" },
      { id: "jospin02", name: "Lionel Jospin", party: "PS", color: "#dc2626" },
    ],
  },
  {
    year: 2007,
    candidates: [
      { id: "sarkozy", name: "Nicolas Sarkozy", party: "UMP", color: "#1d4ed8" },
      { id: "royal", name: "Ségolène Royal", party: "PS", color: "#dc2626" },
      { id: "bayrou07", name: "François Bayrou", party: "UDF", color: "#d97706" },
    ],
  },
  {
    year: 2012,
    candidates: [
      { id: "hollande", name: "François Hollande", party: "PS", color: "#dc2626" },
      { id: "sarkozy12", name: "Nicolas Sarkozy", party: "UMP", color: "#1d4ed8" },
      { id: "lepen12", name: "Marine Le Pen", party: "FN", color: "#b45309" },
      { id: "melenchon12", name: "Jean-Luc Mélenchon", party: "FG", color: "#7c3aed" },
    ],
  },
  {
    year: 2017,
    candidates: [
      { id: "macron", name: "Emmanuel Macron", party: "En Marche!", color: "#d97706" },
      { id: "lepen17", name: "Marine Le Pen", party: "FN", color: "#b45309" },
      { id: "fillon", name: "François Fillon", party: "LR", color: "#1d4ed8" },
      { id: "melenchon17", name: "Jean-Luc Mélenchon", party: "LFI", color: "#7c3aed" },
    ],
  },
  {
    year: 2022,
    candidates: [
      { id: "macron22", name: "Emmanuel Macron", party: "LREM", color: "#d97706" },
      { id: "lepen22", name: "Marine Le Pen", party: "RN", color: "#b45309" },
      { id: "melenchon22", name: "Jean-Luc Mélenchon", party: "LFI", color: "#7c3aed" },
      { id: "zemmour", name: "Éric Zemmour", party: "Reconquête", color: "#dc2626" },
    ],
  },
];

export type Candidate = { id: string; name: string; party: string; color: string };
export type Election = { year: number; candidates: Candidate[] };

export function getElection(year: number): Election | undefined {
  return ELECTIONS.find((e) => e.year === year);
}

export function getCandidate(year: number, candidateId: string): Candidate | undefined {
  return getElection(year)?.candidates.find((c) => c.id === candidateId);
}
