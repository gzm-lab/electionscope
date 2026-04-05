import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ElectionScope — Élections présidentielles françaises",
    template: "%s | ElectionScope",
  },
  description:
    "Explorez 57 ans d'élections présidentielles françaises : cartes interactives, évolution historique et corrélations socio-économiques. De Gaulle (1965) à Macron (2022).",
  keywords: [
    "élections présidentielles",
    "France",
    "cartographie",
    "données électorales",
    "histoire politique",
    "open data",
    "visualisation",
  ],
  authors: [{ name: "ElectionScope" }],
  openGraph: {
    title: "ElectionScope — Élections présidentielles françaises",
    description:
      "57 ans de scrutins présidentiels français visualisés — cartes, timeline et corrélations socio-économiques.",
    type: "website",
    locale: "fr_FR",
    siteName: "ElectionScope",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElectionScope",
    description: "Visualisez les élections présidentielles françaises de 1965 à 2022.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
