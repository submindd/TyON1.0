import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LocaleProvider from "@/components/locale-provider";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import QueryProvider from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TyON — AI Product Research",
  description: "TikTok Shop product research tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="m-0 h-full p-0"
        style={{ backgroundColor: "#EFECE6", fontFamily: "var(--font-geist-sans)" }}
        suppressHydrationWarning
      >
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
      </body>
    </html>
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
        © 2026 TyON Research
      </span>
    </div>
  );
}
