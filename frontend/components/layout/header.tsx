"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/locale-switcher";

/** Extract the page segment from a locale-prefixed path.
 *  e.g. "/en/analysis/wireless%20earbuds" → "analysis"
 *       "/zh/search" → "search"
 */
function getPageSegment(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = locale ("en"|"zh"), segments[1] = page
  return segments.length > 1 ? segments[1] : "";
}

function pageTitleKey(segment: string): "search" | "analysis" | "reports" | null {
  if (segment === "search") return "search";
  if (segment === "analysis") return "analysis";
  if (segment === "report") return "reports";
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const segment = getPageSegment(pathname);
  const key = pageTitleKey(segment);
  const title = key ? t(key) : tc("dashboard");

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
