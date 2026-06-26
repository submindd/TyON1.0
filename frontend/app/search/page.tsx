"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_KEYWORDS = [
  "wireless earbuds",
  "portable blender",
  "phone case",
  "yoga mat",
];

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("search");

  const handleSearch = () => {
    const kw = keyword.trim();
    if (!kw || loading) return;
    setError(null);
    setLoading(true);
    router.push(`/analysis/${encodeURIComponent(kw)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4" style={{ backgroundColor: "#EFECE6" }}>
      <div className="w-full max-w-lg">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Card */}
        <Card
          className="border-0 shadow-sm"
          style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
        >
          <CardContent className="p-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                {t("searchKeyword")}
              </label>
              <Input
                placeholder={t("placeholder")}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-sm placeholder:text-neutral-300"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !keyword.trim()}
              className="mt-3 h-11 w-full rounded-xl bg-neutral-900 text-sm hover:bg-neutral-800"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Search className="mr-1.5" size={16} />
                  {t("startResearch")}
                </>
              )}
            </Button>

            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}

            {/* Demo keywords */}
            <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
              <TrendingUp size={12} className="text-neutral-300" />
              <span className="text-[11px] text-neutral-300">{t("tryLabel")}</span>
              {DEMO_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setKeyword(kw)}
                  disabled={loading}
                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
                >
                  {kw}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px] text-neutral-300">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
