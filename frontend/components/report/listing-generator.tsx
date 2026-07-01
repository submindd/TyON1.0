"use client";

import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import MetricTooltip from "@/components/ui/metric-tooltip";
import type { ListingResponse } from "@/types/report";

interface ListingGeneratorProps {
  listing: ListingResponse;
}

function CopyButton({ text, label }: { text: string; label: string }) {
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
      aria-label={label}
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
}

function ListingSection({
  label,
  content,
  mono = false,
  lang,
  copyLabel,
}: {
  label: string;
  content: string;
  mono?: boolean;
  lang: "en" | "zh";
  copyLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {label}
          <MetricTooltip label={label} lang={lang} />
        </p>
        <CopyButton text={content} label={copyLabel} />
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

export default function ListingGenerator({ listing }: ListingGeneratorProps) {
  const t = useTranslations("listingGenerator");
  const lang = useLocale() as "en" | "zh";

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <FileText size={14} className="text-neutral-500" />
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {t("title")}
            <MetricTooltip label="Listing Generator" lang={lang} />
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <ListingSection
            label={t("seoTitle")}
            content={listing.seo_title[lang]}
            lang={lang}
            copyLabel={t("copyToClipboard")}
          />
          <ListingSection
            label={t("bulletPoints")}
            content={listing.bullets.map((b) => b[lang]).join("\n")}
            lang={lang}
            copyLabel={t("copyToClipboard")}
          />
          <ListingSection
            label={t("productDescription")}
            content={listing.description[lang]}
            lang={lang}
            copyLabel={t("copyToClipboard")}
          />
          <ListingSection
            label={t("backendKeywords")}
            content={listing.backend_keywords.join(", ")}
            mono
            lang={lang}
            copyLabel={t("copyToClipboard")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
