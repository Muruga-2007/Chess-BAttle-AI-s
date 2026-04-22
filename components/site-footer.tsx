import Link from "next/link";
import { navLinks } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/80 bg-black/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="font-display text-2xl text-paper">
            Deterministic rules. Replaceable model layers. Spectator-grade presentation.
          </p>
          <p className="mt-3 text-sm leading-7 text-paper/60">
            This site translates the research report into a product-facing technical experience,
            preserving the compliance boundaries, operational tradeoffs, and roadmap logic from the source document.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-paper/55">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brass">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
