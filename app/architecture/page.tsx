import { Reveal } from "@/components/reveal";
import { architectureFlow, architectureRoles, contractExamples } from "@/lib/site-content";

export default function ArchitecturePage() {
  return (
    <main className="page-shell py-16 md:py-20">
      <Reveal>
        <p className="eyebrow">Architecture</p>
        <h1 className="section-title mt-4 max-w-4xl">
          A deterministic orchestration core surrounded by model adapters.
        </h1>
        <p className="section-copy mt-6">
          The report rejects the idea of models directly owning state. The rules service, event log,
          and ordered session bus are the backbone. Gemini, Ollama, LM Studio, and Stockfish all
          remain external specialists operating through bounded contracts.
        </p>
      </Reveal>

      <section className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="border-t border-line pt-6">
          <p className="eyebrow">Reference flow</p>
          <div className="mt-8 grid gap-4">
            {architectureFlow.map((item, index) => (
              <div key={item} className="flex items-start gap-4">
                <div className="mt-2 h-3 w-3 rounded-full bg-brass" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-paper/40">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-lg leading-8 text-paper/78">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="overflow-hidden rounded-[2rem] border border-paper/10 bg-white/[0.04] p-6 shadow-glow">
          <div className="grid gap-3">
            {[
              "Web UI",
              "Session API",
              "Deterministic orchestrator",
              "Rules service",
              "Stockfish",
              "Gemini",
              "Ollama",
              "LM Studio",
              "Event log + PGN",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-[1.25rem] border px-5 py-4 text-sm uppercase tracking-[0.18em] ${
                  index === 2
                    ? "border-brass/50 bg-brass/10 text-brass"
                    : index === 3 || index === 8
                      ? "border-pine/50 bg-pine/10 text-paper"
                      : "border-paper/10 bg-black/20 text-paper/70"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="eyebrow">Responsibilities</p>
          <h2 className="section-title mt-4">Each system part has one job.</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {architectureRoles.map((item, index) => (
            <Reveal key={item.component} delay={index * 0.06} className="border-t border-line pt-5">
              <p className="font-display text-3xl text-paper">{item.component}</p>
              <p className="mt-3 text-sm leading-7 text-paper/64">{item.role}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-3">
        <Reveal className="lg:col-span-1">
          <p className="eyebrow">Contracts</p>
          <h2 className="section-title mt-4">Small schemas beat regex and guesswork.</h2>
          <p className="mt-6 text-base leading-8 text-paper/68">
            Structured move requests and action replies are the difference between a theatrical AI
            demo and a production-grade chess system. Commentary can stream; legality cannot.
          </p>
        </Reveal>
        <div className="grid gap-6 lg:col-span-2">
          <Reveal className="overflow-hidden rounded-[1.75rem] border border-paper/10 bg-black/30">
            <div className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.22em] text-paper/45">
              Move request
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-7 text-paper/78">
              <code>{contractExamples.moveRequest}</code>
            </pre>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal className="overflow-hidden rounded-[1.75rem] border border-paper/10 bg-black/30">
              <div className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.22em] text-paper/45">
                Move reply
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-7 text-paper/78">
                <code>{contractExamples.moveReply}</code>
              </pre>
            </Reveal>
            <Reveal delay={0.08} className="overflow-hidden rounded-[1.75rem] border border-paper/10 bg-black/30">
              <div className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.22em] text-paper/45">
                Draw claim
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-7 text-paper/78">
                <code>{contractExamples.drawClaim}</code>
              </pre>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
