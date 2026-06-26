"use client";

import { useState, useMemo } from "react";
import { Copy, Check, RefreshCw, FileText } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricTooltip from "@/components/ui/metric-tooltip";
import { generateListing } from "@/lib/listing-template";
import type { AnalysisResult, ResearchProduct, ListingData } from "@/types/report";

interface ListingGeneratorProps {
  analysis: AnalysisResult;
  products: ResearchProduct[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
}

function ListingSection({
  label,
  content,
  mono = false,
  locale,
}: {
  label: string;
  content: string;
  mono?: boolean;
  locale: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {label}
          <MetricTooltip label={label} locale={locale} />
        </p>
        <CopyButton text={content} />
      </div>
      <div
        className="rounded-xl p-3 text-[13px] leading-relaxed text-neutral-700"
        style={{
          backgroundColor: "#F0EDE7",
          fontFamily: mono ? "var(--font-geist-mono), monospace" : undefined,
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default function ListingGenerator({
  analysis,
  products,
}: ListingGeneratorProps) {
  const t = useTranslations("listingGenerator");
  const locale = useLocale();
  const [seed, setSeed] = useState(42);

  const listing: ListingData = useMemo(
    () => generateListing(analysis, products, seed),
    [analysis, products, seed],
  );

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-neutral-500" />
            <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
              {t("title")}
              <MetricTooltip label="Listing Generator" locale={locale} />
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSeed((s) => s + 1)}
            className="h-7 rounded-lg text-[11px] text-neutral-400 hover:text-neutral-600"
          >
            <RefreshCw size={11} className="mr-1" />
            {t("regenerate")}
          </Button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <ListingSection label={t("seoTitle")} content={listing.seoTitle} locale={locale} />
          <ListingSection
            label={t("bulletPoints")}
            content={listing.bullets.join("\n")}
            locale={locale}
          />
          <ListingSection
            label={t("productDescription")}
            content={listing.description}
            locale={locale}
          />
          <ListingSection
            label={t("backendKeywords")}
            content={listing.backendKeywords}
            mono
            locale={locale}
          />
        </div>
      </CardContent>
    </Card>
  );
}
