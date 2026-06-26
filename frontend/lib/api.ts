import type { ProductsResponse, ResearchResponse } from "@/types/report";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function fetchReport(keyword: string): Promise<ResearchResponse> {
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, platform: "tiktok", country: "US" }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body?.detail ?? {};
    const msg = detail?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchAllProducts(): Promise<ProductsResponse> {
  const res = await fetch(`${BASE}/api/products`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.detail?.error ?? body?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}
