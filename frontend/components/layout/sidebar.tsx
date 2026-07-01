"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Package,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const lang = useLocale() as "en" | "zh";

  // Strip locale prefix for active-route matching
  const segments = pathname.split("/").filter(Boolean);
  const pageSegment = segments.length > 1 ? segments[1] : segments[0] ?? "";

  const MENU_ITEMS: {
    label: string;
    icon: typeof Search;
    href: string;
    matchSegment: string;
  }[] = [
    { label: t("search"), icon: Search, href: `/${lang}/search`, matchSegment: "search" },
    { label: t("analysis"), icon: BarChart3, href: `/${lang}/search`, matchSegment: "analysis" },
    { label: t("reports"), icon: FileText, href: `/${lang}/search`, matchSegment: "report" },
    { label: t("products"), icon: Package, href: `/${lang}/products`, matchSegment: "products" },
    { label: t("settings"), icon: Settings, href: `/${lang}/search`, matchSegment: "settings" },
  ];

  return (
    <aside
      className="flex h-full flex-col px-4 py-6"
      style={{ width: 240, backgroundColor: "#E8E4DC" }}
    >
      {/* ---------- Logo ---------- */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {tc("appName")}
        </h1>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          {tc("appTagline")}
        </p>
      </div>

      {/* ---------- Menu ---------- */}
      <nav className="flex flex-1 flex-col gap-1">
        {MENU_ITEMS.map(({ label, icon: Icon, href, matchSegment }) => {
          const active = pageSegment.startsWith(matchSegment);
          return (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-left transition-colors"
              style={{
                backgroundColor: active ? "#ffffff" : "transparent",
                border: active ? "1px solid #D5D0C7" : "1px solid transparent",
                color: active ? "#171717" : "#6B6560",
                fontWeight: active ? 500 : 400,
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ---------- Footer ---------- */}
      <div className="mt-auto px-2">
        <div className="h-px w-full bg-neutral-300/60" />
        <div className="mt-4 space-y-0.5">
          <p className="text-[10px] text-neutral-500">{tc("demoVersion")}</p>
          <p className="text-[10px] text-neutral-400">{tc("platformNote")}</p>
        </div>
      </div>
    </aside>
  );
}
