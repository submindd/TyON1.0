"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useLocaleContext } from "@/components/locale-provider";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const { setLocale } = useLocaleContext();

  const toggle = () => {
    setLocale(locale === "zh" ? "en" : "zh");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
    >
      <Globe size={12} />
      <span>{locale === "zh" ? "EN" : "中文"}</span>
    </button>
  );
}
