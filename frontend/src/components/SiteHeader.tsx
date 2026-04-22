"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Leaf, ScanLine } from "lucide-react";

const navItems = [
  { href: "/" as Route, label: "Home", icon: Home },
  { href: "/scan" as Route, label: "Scan", icon: ScanLine }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-white/55 bg-white/70 px-4 py-3 shadow-glow backdrop-blur-2xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
              <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-moss text-white shadow-[0_18px_40px_rgba(22,32,25,0.22)]">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.26),transparent_58%)]" />
                <Leaf className="relative h-5 w-5" />
              </span>

              <span className="min-w-0">
                <span className="block truncate font-[var(--font-display)] text-2xl font-semibold leading-none text-ink">
                  GreenProof
                </span>
                <span className="mt-1 hidden text-[11px] font-semibold uppercase tracking-[0.26em] text-moss/55 sm:block">
                  Eco-claim fact checker
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === item.href : pathname.startsWith(item.href) || pathname.startsWith("/results");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-moss text-white shadow-[0_10px_22px_rgba(22,32,25,0.16)]"
                        : "text-moss/72 hover:bg-sand/70 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/scan?mode=camera"
                className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss/92"
              >
                <ScanLine className="h-4 w-4" />
                <span className="hidden sm:inline">Start Scan</span>
                <span className="sm:hidden">Scan</span>
              </Link>
            </div>
          </div>

          <div className="mt-3 flex gap-2 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === item.href : pathname.startsWith(item.href) || pathname.startsWith("/results");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-moss text-white shadow-[0_10px_22px_rgba(22,32,25,0.16)]"
                      : "bg-white/70 text-moss/78 hover:bg-sand/70 hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
