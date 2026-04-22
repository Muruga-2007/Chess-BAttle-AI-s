import Link from "next/link";
import { Reveal } from "@/components/reveal";
import {
  heroStats,
  keyPrinciples,
  operatingModes,
  ruleNarratives,
  siteMeta,
} from "@/lib/site-content";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-board board-grid opacity-40" />
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_20%_20%,rgba(196,163,110,0.2),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(61,111,98,0.18),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.15),rgba(10,13,16,0.92))]" />
        <div className="page-shell relative grid min-h-[calc(100svh-72px)] items-end py-16 md:py-20">
          <div className="grid gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <Reveal className="max-w-4xl">
              <p className="eyebrow">Design translation from the research report</p>
              <h1 className="mt-4 font-display text-[clamp(4rem,11vw,8.7rem)] leading-[0.88] text-paper">
                Chess
                <br />
                Local Cloud
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/72 md:text-xl">
                {siteMeta.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/play"
                  className="rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:brightness-110"
                >
                  Launch MVP
                </Link>
                <Link
                  href="/architecture"
                  className="rounded-full border border-paper/18 px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:border-brass hover:text-brass"
                >
                  Explore architecture
                </Link>
                <Link
                  href="/rules"
                  className="rounded-full border border-paper/18 px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:border-brass hover:text-brass"
                >
                  View rules model
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="lg:justify-self-end">
              <div className="relative overflow-hidden rounded-[2rem] border border-brass/20 bg-white/[0.04] p-6 shadow-glow backdrop-blur">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass to-transparent" />
                <div className="grid gap-6">
                  <div>
                    <p className="eyebrow">Official recommendation</p>
                    <p className="mt-3 font-display text-4xl leading-none text-paper">
                      Build the hybrid lane first.
                    </p>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-paper/68">
                      The report is explicit: Gemini vs local is the right first production path because
                      it validates both runtime families, keeps cost under control, and forces the
                      orchestration layer to mature early.
                    </p>
                  </div>
                  <div className="hairline" />
                  <div className="grid gap-4">
                    {heroStats.map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-6">
                        <span className="text-xs uppercase tracking-[0.22em] text-paper/45">
                          {item.label}
                        </span>
                        <span className="max-w-[12rem] text-right text-sm leading-6 text-paper/82">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 md:py-28">
        <Reveal>
          <p className="eyebrow">Core thesis</p>
          <h2 className="section-title mt-4">This is not two chatbots talking on a board.</h2>
          <p className="section-copy mt-6">
            The report argues for a deterministic chess product, not an improvisational one. That
            means one component owns legality, one component owns clocks, one component owns the
            ordered event stream, and every model remains bounded by structured contracts.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {keyPrinciples.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.08}
              className="border-t border-line pt-6"
            >
              <p className="font-display text-3xl text-paper">{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-paper/65">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line/80 bg-white/[0.03] py-20 md:py-28">
        <div className="page-shell">
          <Reveal>
            <p className="eyebrow">Operating modes</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <h2 className="section-title">Three ways to deploy the same system.</h2>
              <p className="section-copy">
                The chess logic barely changes across modes. The real differences are latency,
                privacy posture, cost exposure, and hardware pressure. The report's recommendation
                is to use the same orchestration core across all three and vary only the adapters.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            {operatingModes.map((mode, index) => (
              <Reveal key={mode.name} delay={index * 0.1} className="border-t border-brass/25 pt-6">
                <p className="text-xs uppercase tracking-[0.24em] text-brass/80">{mode.verdict}</p>
                <h3 className="mt-3 font-display text-4xl text-paper">{mode.name}</h3>
                <div className="mt-6 space-y-3 text-sm leading-7 text-paper/68">
                  <p>
                    <span className="text-paper/95">Latency:</span> {mode.latency}
                  </p>
                  <p>
                    <span className="text-paper/95">Privacy:</span> {mode.privacy}
                  </p>
                  <p>{mode.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <p className="eyebrow">Rules and behavior</p>
            <h2 className="section-title mt-4">
              FIDE-exact behavior and consumer-grade UX should not be conflated.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-paper/68">
              The report's sharpest product decision is to ship two clearly labeled rules profiles:
              one for strict FIDE semantics and one for practical application behavior. The site keeps
              that distinction front and center instead of burying it in documentation.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/rules"
                className="rounded-full border border-brass/40 px-5 py-3 text-xs uppercase tracking-[0.22em] text-brass transition hover:bg-brass hover:text-ink"
              >
                Open rules profile
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-8">
            {ruleNarratives.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.08}
                className="grid gap-4 border-l border-line pl-6 md:grid-cols-[0.36fr_0.64fr]"
              >
                <p className="font-display text-3xl leading-none text-paper">{item.title}</p>
                <p className="text-sm leading-7 text-paper/66">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line/80 py-20 md:py-28">
        <div className="page-shell grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-paper/10 bg-white/[0.04] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,127,91,0.16),transparent_18%),radial-gradient(circle_at_78%_25%,rgba(61,111,98,0.18),transparent_22%)]" />
            <div className="relative">
              <p className="eyebrow">Site structure</p>
              <h2 className="section-title mt-4">A product site with technical depth, not a report dump.</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-paper/68">
                The build translates the document into separate surfaces for architecture, rules,
                deployment tradeoffs, and roadmap operations. That keeps the homepage fast and dramatic
                while preserving full technical depth in route-level sections.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="grid content-start gap-5">
            {[
              ["/architecture", "Architecture", "Event flow, provider boundaries, message contracts, and service roles."],
              ["/play", "Play", "Create a match, step the orchestrator, inspect clocks, commentary, and draw semantics."],
              ["/deployment", "Deployment", "Latency, privacy, local model tiers, costs, and operational posture."],
              ["/roadmap", "Roadmap", "Implementation phases, testing matrix, fallback policy, and primary sources."],
            ].map(([href, title, text]) => (
              <Link
                key={href}
                href={href}
                className="group border-b border-line pb-5 transition hover:border-brass/50"
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="font-display text-3xl text-paper">{title}</p>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-paper/60">{text}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.24em] text-brass transition group-hover:translate-x-1">
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
