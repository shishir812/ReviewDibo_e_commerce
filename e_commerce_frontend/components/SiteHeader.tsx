"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import CustomerNavLink from "@/components/CustomerNavLink";

export default function SiteHeader() {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-ink">
          Review Debo
        </Link>
        {isAdminArea ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Admin workspace
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CustomerNavLink />
            <Link href="/admin" className="text-sm font-semibold text-slate-600 hover:text-primary">
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
