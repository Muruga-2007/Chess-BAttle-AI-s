import Link from "next/link";
import { navLinks, siteMeta } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-xl uppercase tracking-[0.22em] text-paper">
            {siteMeta.title}
          </span>
          <span className="text-[10px] uppercase tracking-[0.34em] text-paper/45">
            FIDE-aware orchestration for AI chess
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-paper/70 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-brass"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/roadmap"
          className="rounded-full border border-brass/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-brass transition hover:border-brass hover:bg-brass hover:text-ink"
        >
          Build Plan
        </Link>
      </div>
    </header>
  );
}
