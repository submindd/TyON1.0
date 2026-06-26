"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

// Static imports — both locale files bundled, zero runtime fetch
import enMessages from "@/locales/en.json";
import zhMessages from "@/locales/zh.json";

type Locale = "en" | "zh";

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en: enMessages as unknown as Record<string, unknown>,
  zh: zhMessages as unknown as Record<string, unknown>,
};

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  const cookie = match?.[1];
  if (cookie === "zh" || cookie === "en") return cookie;
  // Fallback to browser language
  if (typeof navigator !== "undefined" && navigator.language?.startsWith("zh")) return "zh";
  return "en";
}

function setCookieLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

// ---- Context for locale switching ----
const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "en", setLocale: () => {} });

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getCookieLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setCookieLocale(l);
    setLocaleState(l);
  }, []);

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <NextIntlClientProvider locale="en" messages={MESSAGES.en}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}
