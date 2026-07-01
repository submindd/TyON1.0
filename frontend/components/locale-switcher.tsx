"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useLocaleContext } from "@/components/locale-provider";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const { setLocale } = useLocaleContext();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const nextLocale = locale === "zh" ? "en" : "zh";

    // Replace the locale segment in the current URL
    const segments = pathname.split("/").filter(Boolean);
    // segments[0] = current locale, segments[1..] = rest of path
    segments[0] = nextLocale;
    const newPathname = "/" + segments.join("/");

    setLocale(nextLocale);
    router.replace(newPathname);
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
