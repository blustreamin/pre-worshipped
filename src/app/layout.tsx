import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pre-Worshipped | Car Intelligence Dashboard",
  description: "Smart used car scouting for the Indian market",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "var(--bg)", color: "var(--text)" }}>
        {children}
      </body>
    </html>
  );
}
