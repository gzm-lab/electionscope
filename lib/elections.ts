// Election years and candidates data
export const ELECTIONS = [
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
