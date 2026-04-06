"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";

export default function HomePage() {
  const t = useTranslations("hero");
  const nt = useTranslations("nav");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { value: "11", label: t("stats.elections"), icon: "🗳️" },
    { value: "1965–2022", label: t("stats.years"), icon: "📅" },
    { value: "35k", label: t("stats.communes"), icon: "🏘️" },
  ];

  return (
    <main className="min-h-screen animated-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold gradient-text">ElectionScope</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link
              href={`/${locale}/explore`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {nt("explore")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {nt("about")}
            </Link>
            <LanguageSwitcher />
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-8">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs text-blue-400 border-blue-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            data.gouv.fr · INSEE · Open Data
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight"
          >
            <span className="gradient-text">{t("title")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 font-light mb-4"
          >
            {t("subtitle")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t("description")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link href={`/${locale}/explore`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("cta")}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-12 flex flex-wrap gap-4 justify-center"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="glass rounded-xl px-6 py-4 text-center min-w-[140px] glow-blue"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
