import { Reveal } from "@/components/reveal";
import { fallbackPolicies, roadmapPhases, sourceGroups, testingMatrix } from "@/lib/site-content";

export default function RoadmapPage() {
  return (
    <main className="page-shell py-16 md:py-20">
      <Reveal>
        <p className="eyebrow">Roadmap and hardening</p>
        <h1 className="section-title mt-4 max-w-4xl">
          A small-team delivery plan that treats chess rules, model failure, and product polish as separate workstreams.
        </h1>
        <p className="section-copy mt-6">
          The report estimates roughly 14 to 20 weeks for a production-ready implementation. The main reason is not
          UI alone. It is the combination of authoritative rules, provider adapters, synchronization, and test coverage
          against malformed model behavior.
        </p>
      </Reveal>

      <section className="mt-16 grid gap-8">
        {roadmapPhases.map((phase, index) => (
          <Reveal
            key={phase.phase}
            delay={index * 0.07}
            className="grid gap-4 border-t border-line py-6 md:grid-cols-[0.24fr_0.18fr_0.58fr]"
          >
            <p className="font-display text-3xl text-paper">{phase.phase}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-brass/75">{phase.window}</p>
            <p className="text-sm leading-7 text-paper/66">{phase.items}</p>
          </Reveal>
        ))}
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Testing matrix</p>
          <h2 className="section-title mt-4">The most important fuzz target is illegal model output.</h2>
          <div className="mt-8 grid gap-4">
            {testingMatrix.map(([label, text]) => (
              <div key={label} className="border-b border-line pb-4">
                <p className="font-display text-2xl text-paper">{label}</p>
                <p className="mt-2 text-sm leading-7 text-paper/65">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow">Fallback policy</p>
          <h2 className="section-title mt-4">Degradation should be deterministic, not improvised.</h2>
          <div className="mt-8 grid gap-4">
            {fallbackPolicies.map(([label, text]) => (
              <div key={label} className="border-b border-line pb-4">
                <p className="font-display text-2xl text-paper">{label}</p>
                <p className="mt-2 text-sm leading-7 text-paper/65">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-20 rounded-[2rem] border border-paper/10 bg-white/[0.04] p-8">
        <Reveal>
          <p className="eyebrow">Primary source stack</p>
          <h2 className="section-title mt-4">The site preserves the report's source categories.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sourceGroups.map((group, index) => (
              <div key={group} className="border-t border-line pt-4 text-sm leading-7 text-paper/68">
                <span className="mr-3 text-xs uppercase tracking-[0.22em] text-brass/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {group}
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
