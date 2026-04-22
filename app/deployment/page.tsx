import { Reveal } from "@/components/reveal";
import {
  costHighlights,
  deploymentModes,
  localModelTiers,
  securityNotes,
} from "@/lib/site-content";

export default function DeploymentPage() {
  return (
    <main className="page-shell py-16 md:py-20">
      <Reveal>
        <p className="eyebrow">Deployment and operations</p>
        <h1 className="section-title mt-4 max-w-4xl">
          Same chess engine, different latency, privacy, and hardware realities.
        </h1>
        <p className="section-copy mt-6">
          The deployment section of the report is mostly an operations argument. The question is not whether
          the chess logic works. The question is where inference runs, how much it costs, and what level of
          privacy and hardware pressure the product can tolerate.
        </p>
      </Reveal>

      <section className="mt-16 grid gap-8 lg:grid-cols-3">
        {deploymentModes.map((mode, index) => (
          <Reveal key={mode.mode} delay={index * 0.08} className="border-t border-line pt-6">
            <p className="eyebrow">{mode.mode}</p>
            <p className="mt-3 font-display text-4xl text-paper">{mode.bestFor}</p>
            <p className="mt-5 text-sm leading-7 text-paper/68">
              <span className="text-paper">Latency:</span> {mode.latency}
            </p>
            <p className="mt-2 text-sm leading-7 text-paper/68">
              <span className="text-paper">Main risk:</span> {mode.risk}
            </p>
          </Reveal>
        ))}
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <p className="eyebrow">Local model tiers</p>
          <h2 className="section-title mt-4">Dual-local mode is a hardware planning problem.</h2>
          <p className="mt-6 text-base leading-8 text-paper/68">
            The report treats local-vs-local as viable but demanding. Artifact sizes and runtime memory
            pressure make it clear that not every workstation should be expected to run two premium local
            models concurrently with rich commentary.
          </p>
        </Reveal>
        <div className="grid gap-6">
          {localModelTiers.map((tier, index) => (
            <Reveal
              key={tier.tier}
              delay={index * 0.08}
              className="rounded-[1.6rem] border border-paper/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-display text-3xl text-paper">{tier.tier}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-brass/80">{tier.tags}</p>
                </div>
                <p className="max-w-xl text-sm leading-7 text-paper/66">{tier.recommendation}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <Reveal className="rounded-[1.8rem] border border-brass/20 bg-brass/8 p-8">
          <p className="eyebrow">Estimated cloud economics</p>
          <h2 className="section-title mt-4">Token cost is manageable until experimentation scales up.</h2>
          <div className="mt-8 grid gap-4">
            {costHighlights.map((item) => (
              <div key={item} className="border-b border-brass/15 pb-4 text-sm leading-7 text-paper/72">
                {item}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="rounded-[1.8rem] border border-paper/10 bg-white/[0.04] p-8">
          <p className="eyebrow">Privacy and security</p>
          <h2 className="section-title mt-4">Protect data paths and package secrets correctly.</h2>
          <div className="mt-8 grid gap-4">
            {securityNotes.map((item) => (
              <div key={item} className="border-b border-line pb-4 text-sm leading-7 text-paper/68">
                {item}
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
