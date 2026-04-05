"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, type Transition } from "framer-motion";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";

const SOURCES = [
  {
    label: "Ministère de l'Intérieur",
    desc: "Résultats officiels des élections présidentielles françaises (1965–2022).",
    url: "https://www.interieur.gouv.fr/Elections/Les-resultats",
    badge: "Officiel",
  },
  {
    label: "INSEE",
    desc: "Données socio-économiques par département : revenu médian, taux de chômage, taux de pauvreté.",
    url: "https://www.insee.fr",
    badge: "Officiel",
  },
  {
    label: "GeoJSON France",
    desc: "Contours des départements métropolitains (OpenData).",
    url: "https://france-geojson.gregoiredavid.fr",
    badge: "Open Data",
  },
];

const FEATURES = [
  { icon: "🗺️", title: "Carte choroplèthe", desc: "Visualisation des résultats par département, en mode candidat ou gagnant." },
  { icon: "📈", title: "Timeline historique", desc: "Évolution des scores des principaux candidats de 1965 à 2022." },
  { icon: "📊", title: "Corrélations socio-éco", desc: "Nuage de points entre résultats électoraux et indicateurs INSEE (revenu, chômage, pauvreté)." },
  { icon: "🏆", title: "Résultats nationaux", desc: "Classement et pourcentages agrégés pour chaque élection et chaque tour." },
];

const STACK = [
  { label: "Next.js 14", color: "#fff" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "Tailwind CSS", color: "#38bdf8" },
  { label: "Framer Motion", color: "#bb6bd9" },
  { label: "Recharts", color: "#22c55e" },
  { label: "D3.js", color: "#f97316" },
  { label: "Leaflet", color: "#84cc16" },
];

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

function fadeUp(delay = 0) {
  const transition: Transition = { duration: 0.45, delay, ease: EASE };
  return {
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition,
  };
}

export default function AboutPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Navbar */}
      <nav className="glass border-b border-white/5 px-4 py-2.5 flex items-center justify-between shrink-0 z-40">
        <Link href={`/${locale}`} className="hover:opacity-80 transition-opacity">
          <span className="text-base font-black gradient-text">ElectionScope</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/explore`}
            className="glass rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Explorer →
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto w-full px-6 py-16">
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-gray-400 mb-6">
            <span>ℹ️</span> À propos d&apos;ElectionScope
          </div>
          <h1 className="text-4xl font-black gradient-text mb-4">
            L&apos;histoire électorale française, visualisée
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            ElectionScope permet d&apos;explorer 57 ans d&apos;élections présidentielles françaises
            à travers des cartes interactives, des graphiques historiques et des corrélations
            socio-économiques — de De Gaulle à Macron, en passant par Mitterrand et Chirac.
          </p>
        </motion.div>

        {/* Features */}
        <motion.section {...fadeUp(0.1)} className="mt-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sources */}
        <motion.section {...fadeUp(0.2)} className="mt-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Sources des données
          </h2>
          <div className="space-y-3">
            {SOURCES.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 glass rounded-xl p-4 border border-white/5 hover:border-white/15 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                      {s.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5">↗</span>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Stack */}
        <motion.section {...fadeUp(0.3)} className="mt-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Stack technique
          </h2>
          <div className="flex flex-wrap gap-2">
            {STACK.map((t) => (
              <span
                key={t.label}
                className="glass rounded-full px-3 py-1.5 text-xs font-medium border border-white/5"
                style={{ color: t.color }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Note */}
        <motion.section {...fadeUp(0.4)} className="mt-14">
          <div className="glass rounded-xl p-5 border border-yellow-500/10">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-400 text-sm mb-1">Note sur les données</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Les résultats nationaux sont issus des archives officielles du Ministère de
                  l&apos;Intérieur. La distribution par département est une{" "}
                  <strong className="text-gray-300">reconstitution statistiquement réaliste</strong>{" "}
                  basée sur les patterns historiques connus — les fichiers bruts par département
                  antérieurs à 2002 ne sont pas disponibles en open data structuré. Les données
                  socio-économiques sont indicatives.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div {...fadeUp(0.5)} className="mt-14 text-center">
          <Link
            href={`/${locale}/explore`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold px-6 py-3 rounded-xl text-sm"
          >
            <span>🗺️</span> Commencer à explorer
          </Link>
        </motion.div>

        <motion.footer
          {...fadeUp(0.6)}
          className="mt-14 pt-8 border-t border-white/5 text-center text-xs text-gray-600"
        >
          ElectionScope — Projet open source · Données publiques françaises
        </motion.footer>
      </div>
    </div>
  );
}
