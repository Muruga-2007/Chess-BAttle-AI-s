import { Reveal } from "@/components/reveal";
import { ruleNarratives, rulesComparison } from "@/lib/site-content";

export default function RulesPage() {
  return (
    <main className="page-shell py-16 md:py-20">
      <Reveal>
        <p className="eyebrow">Rules model</p>
        <h1 className="section-title mt-4 max-w-4xl">
          Strict FIDE mode and practical app mode need separate semantics.
        </h1>
        <p className="section-copy mt-6">
          The report's legal core is unambiguous: the app should never trust a move because it looks
          plausible. It should trust only moves validated against the authoritative position, clock state,
          and claim context.
        </p>
      </Reveal>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        {ruleNarratives.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.07} className="border-t border-line pt-5">
            <p className="font-display text-3xl text-paper">{item.title}</p>
            <p className="mt-4 text-sm leading-7 text-paper/65">{item.text}</p>
          </Reveal>
        ))}
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="eyebrow">Rules profile table</p>
          <h2 className="section-title mt-4">Operationalizing the Laws in software.</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-[2rem] border border-paper/10 bg-white/[0.03]">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-line px-5 py-4 text-xs uppercase tracking-[0.22em] text-paper/45 md:px-8">
            <div>Rule area</div>
            <div>Strict FIDE mode</div>
            <div>Practical app mode</div>
          </div>
          {rulesComparison.map((row) => (
            <div
              key={row.area}
              className="grid grid-cols-1 border-b border-line/70 px-5 py-5 text-sm leading-7 text-paper/72 md:grid-cols-[1.2fr_1fr_1fr] md:px-8"
            >
              <div className="font-semibold text-paper">{row.area}</div>
              <div className="pt-3 md:pt-0">{row.strict}</div>
              <div className="pt-3 md:pt-0">{row.practical}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="border-t border-line pt-6">
          <p className="eyebrow">Product implication</p>
          <h2 className="section-title mt-4">The label on the mode matters.</h2>
        </Reveal>
        <Reveal delay={0.12} className="text-base leading-8 text-paper/68">
          <p>
            If a mode is presented as FIDE-compliant, it should not silently auto-adjudicate from engine
            centipawns, auto-promote without explicit schema support, or let client animation timing become
            the source of truth. Those are practical shortcuts, not strict arbiting logic.
          </p>
          <p className="mt-5">
            The report recommends shipping both semantics deliberately: a literal mode for correctness and
            a consumer-friendly mode for smoother AI-vs-AI product behavior. That is not duplication; it is
            honest product framing.
          </p>
        </Reveal>
      </section>
    </main>
  );
}
