"use client";

import { DollarSign, ShoppingCart, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ResearchProduct } from "@/types/report";

interface ProductCardProps {
  product: ResearchProduct;
  index: number;
  variant?: "row" | "grid";
}

export default function ProductCard({
  product,
  index,
  variant = "row",
}: ProductCardProps) {
  const t = useTranslations("common");
  const isTarget = index === 0;

  if (variant === "grid") {
    return (
      <div
        className="rounded-2xl p-3 transition-colors"
        style={{ backgroundColor: isTarget ? "#F0EDE7" : "#ffffff", border: "1px solid #D5D0C7" }}
      >
        <div className="mb-2 flex items-start justify-between">
          <span
            className="rounded-lg px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: isTarget ? "#DCD7CF" : "#F0EDE7",
              color: isTarget ? "#171717" : "#a3a3a3",
            }}
          >
            {isTarget ? t("target") : `#${index + 1}`}
          </span>
          {product.data_source === "seed" && (
            <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-[9px] text-neutral-500">
              {t("cached")}
            </span>
          )}
        </div>
        <p className="mb-2 line-clamp-2 text-[13px] font-medium leading-snug text-neutral-800">
          {product.title ?? t("untitled")}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
          <span className="flex items-center gap-0.5">
            <DollarSign size={11} />
            {product.price != null ? `$${product.price.toFixed(2)}` : "—"}
          </span>
          <span className="flex items-center gap-0.5">
            <ShoppingCart size={11} />
            {product.sold_count ?? "—"}
          </span>
          <span className="flex items-center gap-0.5">
            <Star size={11} />
            {product.rating?.toFixed(1) ?? "—"}
          </span>
        </div>
        {product.shop_name && (
          <p className="mt-1.5 text-[11px] text-neutral-300">{product.shop_name}</p>
        )}
      </div>
    );
  }

  // Default: compact row layout
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3 transition-colors"
      style={{ backgroundColor: isTarget ? "#F0EDE7" : "transparent" }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-medium"
        style={{
          backgroundColor: isTarget ? "#DCD7CF" : "#F0EDE7",
          color: isTarget ? "#171717" : "#a3a3a3",
        }}
      >
        {isTarget ? "★" : `#${index + 1}`}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-neutral-800">
          {product.title ?? t("untitled")}
          {product.data_source === "seed" && (
            <span className="ml-1.5 rounded-md bg-neutral-200 px-1.5 py-0.5 text-[9px] text-neutral-500">
              {t("cached")}
            </span>
          )}
        </p>
        <div className="mt-0.5 flex items-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-0.5">
            <DollarSign size={11} />
            {product.price != null ? `$${product.price.toFixed(2)}` : "—"}
          </span>
          <span className="flex items-center gap-0.5">
            <ShoppingCart size={11} />
            {product.sold_count ?? "—"}
          </span>
          <span className="flex items-center gap-0.5">
            <Star size={11} />
            {product.rating?.toFixed(1) ?? "—"}
          </span>
          <span className="truncate text-neutral-300">
            {product.shop_name ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
