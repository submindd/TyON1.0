"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/locale-switcher";

function pageTitle(pathname: string): "search" | "analysis" | "reports" | null {
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/analysis")) return "analysis";
  if (pathname.startsWith("/report")) return "reports";
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const key = pageTitle(pathname);
  const title = key ? t(key) : "Dashboard";

  return (
    <header
      className="flex items-center justify-between px-5"
      style={{
        height: 48,
        backgroundColor: "#2d2d2d",
        borderBottom: "1px solid #3d3d3d",
      }}
    >
      <span className="text-[13px] font-medium tracking-wide text-neutral-300">
        {title}
      </span>
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <span className="text-[11px] text-neutral-500">{tc("appVersion")}</span>
      </div>
    </header>
  );
}
