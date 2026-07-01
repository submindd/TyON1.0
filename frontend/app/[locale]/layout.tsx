import type { Metadata } from "next";
import { isLocale, defaultLocale } from "@/i18n.config";
import LocaleProvider from "@/components/locale-provider";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import QueryProvider from "@/components/query-provider";

// ---------------------------------------------------------------------------
// Dynamic metadata — switches by locale
// ---------------------------------------------------------------------------
type LayoutProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const isZh = locale === "zh";

  return {
    title: isZh ? "TyON — AI 产品研究" : "TyON — AI Product Research",
    description: isZh
      ? "TikTok Shop 商品研究工具"
      : "TikTok Shop product research tool",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Locale layout — shell for all /{locale}/* routes
// ---------------------------------------------------------------------------
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Note: params is not used directly here because LocaleProvider reads
  // locale from cookie (set by middleware) and navigator.language fallback.
  // The middleware ensures the URL and cookie are always in sync.

  return (
    <LocaleProvider>
      <div className="dashboard-grid min-h-screen">
        <div className="grid-area-sidebar">
          <Sidebar />
        </div>
        <div className="grid-area-header">
          <Header />
        </div>
        <main className="grid-area-main overflow-auto">
          <QueryProvider>{children}</QueryProvider>
        </main>
        <div className="grid-area-statusbar">
          <StatusBar />
        </div>
      </div>
    </LocaleProvider>
  );
}

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        height: 28,
        backgroundColor: "#2d2d2d",
        borderTop: "1px solid #3d3d3d",
      }}
    >
      <span className="text-[10px] text-neutral-500">
        TyON v0.1.0
      </span>
      <span className="text-[10px] text-neutral-500">
        &copy; 2026 TyON Research
      </span>
    </div>
  );
}
