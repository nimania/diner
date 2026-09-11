import type { Metadata } from "next";
import "./globals.css";
import "./diner.css";

export const metadata: Metadata = {
  title: "داینر | دفتر رستوران",
  description: "ثبت مواد، رسپی و ضایعات رستوران",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
