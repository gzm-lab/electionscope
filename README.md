# ElectionScope 🗺️

**Visualisez 57 ans d'élections présidentielles françaises** — cartes interactives, timeline historique et corrélations socio-économiques.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Fonctionnalités

| Feature | Description |
|---------|-------------|
| 🗺️ **Carte choroplèthe** | Résultats par département — mode candidat ou gagnant |
| 📈 **Timeline historique** | Évolution des scores de 1965 à 2022 (Recharts) |
| 📊 **Corrélations socio-éco** | Scatter plot revenu / chômage / pauvreté vs résultats |
| 🏆 **Résultats nationaux** | Classement animé avec barres de progression |
| 🔍 **Drill-down département** | Panel détaillé au clic (desktop) / bottom sheet (mobile) |
| 🌍 **i18n** | Français / Anglais (next-intl) |
| 📱 **Responsive** | Sidebar drawer sur mobile |

## Stack

- **Next.js 14** App Router
- **TypeScript**
- **Tailwind CSS** + glassmorphism custom
- **Framer Motion** animations
- **Leaflet / react-leaflet** carte interactive
- **Recharts** timeline & scatter plot
- **D3.js** interpolations couleur
- **next-intl** internationalisation

## Données

| Source | Usage |
|--------|-------|
| [Ministère de l'Intérieur](https://www.interieur.gouv.fr/Elections/Les-resultats) | Résultats nationaux officiels |
| [INSEE](https://www.insee.fr) | Indicateurs socio-économiques départementaux |
| [france-geojson](https://france-geojson.gregoiredavid.fr) | GeoJSON des départements |

> **Note** : La distribution par département est une reconstitution statistiquement réaliste — les données brutes pré-2002 ne sont pas disponibles en open data structuré.

## Démarrage rapide

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Structure

```
app/[locale]/
  page.tsx          # Homepage
  explore/page.tsx  # Explorateur principal
  about/page.tsx    # À propos / Sources

components/
  Charts/           # NationalResults, ScatterPlot, TimelineChart
  Controls/         # YearSelector, TourSelector, CandidateSelector, IndicatorSelector
  Map/              # ElectionMap, DeptPanel
  UI/               # GlassPanel, LanguageSwitcher

public/data/
  index.json        # Métadonnées élections + résultats nationaux
  {year}-t{tour}.json  # Résultats par département
  socioeco.json     # Indicateurs INSEE
  departements.geojson  # GeoJSON métropole
```

## Élections couvertes

1965, 1969, 1974, 1981, 1988, 1995, 2002, 2007, 2012, 2017, 2022 — 11 scrutins, 2 tours chacun.

## Licence

MIT
