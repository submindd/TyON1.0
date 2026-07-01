"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isLocale, defaultLocale } from "@/i18n.config";

export default function LocaleHomePage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;

  useEffect(() => {
    router.replace(`/${locale}/search`);
  }, [locale, router]);

  return null;
}
