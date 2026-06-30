import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";

import "./globals.css";

export const metadata: Metadata = {
  title: "Review Debo E-Commerce",
  description: "A product review platform built with Next.js and FastAPI"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
