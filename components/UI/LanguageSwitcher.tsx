"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const newLocale = locale === "fr" ? "en" : "fr";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="glass rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
    >
      <span>{locale === "fr" ? "🇫🇷" : "🇬🇧"}</span>
      <span>{locale === "fr" ? "FR" : "EN"}</span>
      <span className="text-gray-600">→</span>
      <span>{locale === "fr" ? "EN" : "FR"}</span>
    </motion.button>
  );
}
