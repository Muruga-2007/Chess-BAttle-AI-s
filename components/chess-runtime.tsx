"use client";

import { motion } from "framer-motion";
import { Chess } from "chess.js";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CommentaryEntry,
  CreateSessionInput,
  ProviderDescriptor,
  SessionState,
  Side,
} from "@/lib/chess/types";

const PIECES: Record<string, string> = {
  wp: "\u2659",
  wn: "\u2658",
  wb: "\u2657",
  wr: "\u2656",
  wq: "\u2655",
  wk: "\u2654",
  bp: "\u265F",
  bn: "\u265E",
  bb: "\u265D",
  br: "\u265C",
  bq: "\u265B",
  bk: "\u265A",
};

const modeOptions = [
  {
    value: "cloud_vs_local",
    label: "Gemini vs local",
    note: "One cloud voice, one local grinder.",
    stamp: "Hybrid",
  },
  {
    value: "cloud_vs_cloud",
    label: "Gemini vs Gemini",
    note: "Pure cloud exhibition duel.",
    stamp: "Showcase",
  },
  {
    value: "local_vs_local",
    label: "Local vs local",
    note: "Offline-first sparring room.",
    stamp: "Private",
  },
] as const;

const ruleOptions = [
  {
    value: "strict_fide",
    label: "Strict FIDE",
    note: "Claimable draw semantics stay literal.",
  },
  {
    value: "practical_app",
    label: "Practical app",
    note: "The server can surface practical draw moments.",
  },
] as const;

const INITIAL_FORM: CreateSessionInput = {
  mode: "cloud_vs_local",
  rulesProfile: "practical_app",
  whiteMs: 5 * 60 * 1000,
  blackMs: 5 * 60 * 1000,
  incrementMs: 2_000,
};

type ThinkingState = {
  side: Side;
  provider: ProviderDescriptor;
  thinkMs: number;
  message: string;
};

export function ChessRuntime() {
  const [form, setForm] = useState<CreateSessionInput>(INITIAL_FORM);
  const [session, setSession] = useState<SessionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [logFilter, setLogFilter] = useState("");
  const [thinking, setThinking] = useState<ThinkingState | null>(null);
  const deferredFilter = useDeferredValue(logFilter);
  const sessionRef = useRef<SessionState | null>(null);
  const busyRef = useRef(false);
  const autoplayRef = useRef(false);

  const board = useMemo(
    () => (session ? new Chess(session.fen).board() : new Chess().board()),
    [session],
  );

  const filteredEvents = useMemo(() => {
    if (!session) {
      return [];
    }

    const query = deferredFilter.trim().toLowerCase();
    if (!query) {
      return session.events;
    }

    return session.events.filter((event) =>
      event.summary.toLowerCase().includes(query),
    );
  }, [deferredFilter, session]);

  const lastMove = session?.moves.at(-1) ?? null;
  const whiteCommentary =
    session?.commentary.filter((entry) => entry.side === "white") ?? [];
  const blackCommentary =
    session?.commentary.filter((entry) => entry.side === "black") ?? [];

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    if (!autoplay) {
      return;
    }

    const handle = window.setInterval(() => {
      const currentSession = sessionRef.current;

      if (!currentSession || currentSession.result || busyRef.current) {
        return;
      }

      startTransition(() => {
        void advance(currentSession);
      });
    }, 2600);

    return () => window.clearInterval(handle);
  }, [autoplay]);

  useEffect(() => {
    if (session?.result) {
      setAutoplay(false);
      setThinking(null);
    }
  }, [session?.result]);

  async function create() {
    setBusy(true);

    try {
      const next = await fetchJson<SessionState>("/api/session", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSession(next);
    } finally {
      setBusy(false);
    }
  }

  async function advance(currentSession: SessionState) {
    const provider =
      currentSession.turn === "white"
        ? currentSession.whiteProvider
        : currentSession.blackProvider;
    const thinkMs = currentSession.upcomingThinkMs ?? provider.baseThinkMs;
    const nextThinking: ThinkingState = {
      side: currentSession.turn,
      provider,
      thinkMs,
      message: buildThinkingLine(provider, currentSession.turn),
    };

    setBusy(true);
    setThinking(nextThinking);

    try {
      await wait(clampThinkingDelay(thinkMs));
      const next = await fetchJson<SessionState>(
        `/api/session/${currentSession.id}/advance`,
        {
          method: "POST",
        },
      );
      setSession(next);
    } finally {
      setBusy(false);
      setThinking(null);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(212,127,91,0.18),transparent_16%),radial-gradient(circle_at_85%_18%,rgba(61,111,98,0.18),transparent_18%),linear-gradient(180deg,#06080a_0%,#0b1014_40%,#07090c_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.12]" />
      <div className="absolute inset-x-0 top-[-10rem] mx-auto h-[24rem] w-[24rem] rounded-full bg-brass/10 blur-3xl" />

      <div className="relative mx-auto max-w-[110rem] px-4 py-8 md:px-6 xl:px-10">
        <section className="grid gap-6 border-b border-white/10 pb-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-brass/78">
              AI Match Room
            </p>
            <h1 className="mt-3 font-display text-[clamp(3.8rem,9vw,7.2rem)] leading-[0.88] text-paper">
              Two engines.
              <br />
              One board.
              <br />
              Zero fake calm.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-paper/62">
              The board stays authoritative in the middle while each side talks like a player, not
              a logging system. Thinking time, mood, and move reactions are visible as part of the
              match.
            </p>
          </div>

          <div className="grid gap-3 self-end md:grid-cols-4">
            <HeroMetric
              label="Status"
              value={session ? describeStatus(session) : "Ready"}
            />
            <HeroMetric
              label="Mode"
              value={session ? labelMode(session.mode) : labelMode(form.mode)}
            />
            <HeroMetric
              label="Eval"
              value={session ? `${session.analysis.evaluationCp} cp` : "-"}
            />
            <HeroMetric
              label="Ply"
              value={session ? String(session.ply) : "0"}
            />
          </div>
        </section>

        <main className="mt-8 grid gap-6">
          <ControlDeck
            form={form}
            busy={busy}
            autoplay={autoplay}
            session={session}
            thinking={thinking}
            onChange={setForm}
            onCreate={create}
            onToggleAutoplay={() => setAutoplay((current) => !current)}
            onAdvance={() => session && void advance(session)}
          />

          <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,58rem)_18rem] xl:items-center xl:justify-center">
            <aside className="order-2 grid gap-5 xl:order-1">
              <ConversationRail
                title="White channel"
                side="white"
                provider={session?.whiteProvider ?? previewProvider(form.mode, "white")}
                entries={whiteCommentary}
                thinking={thinking?.side === "white" ? thinking : null}
                clock={formatClock(session?.whiteMs ?? form.whiteMs)}
              />
            </aside>

            <div className="order-1 xl:order-2">
              <BoardStage
                board={board}
                lastMove={lastMove}
                turn={session?.turn ?? "white"}
                whiteProvider={session?.whiteProvider ?? previewProvider(form.mode, "white")}
                blackProvider={session?.blackProvider ?? previewProvider(form.mode, "black")}
                whiteClock={formatClock(session?.whiteMs ?? form.whiteMs)}
                blackClock={formatClock(session?.blackMs ?? form.blackMs)}
              />
            </div>

            <aside className="order-3 grid gap-5">
              <ConversationRail
                title="Black channel"
                side="black"
                provider={session?.blackProvider ?? previewProvider(form.mode, "black")}
                entries={blackCommentary}
                thinking={thinking?.side === "black" ? thinking : null}
                clock={formatClock(session?.blackMs ?? form.blackMs)}
              />
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <AnalysisDeck session={session} />
            <EventPanel
              events={filteredEvents}
              filter={logFilter}
              onFilterChange={setLogFilter}
            />
          </section>

          <PGNPanel pgn={session?.pgn ?? "No moves yet."} />
        </main>
      </div>
    </div>
  );
}

function ControlDeck({
  form,
  busy,
  autoplay,
  session,
  thinking,
  onChange,
  onCreate,
  onToggleAutoplay,
  onAdvance,
}: {
  form: CreateSessionInput;
  busy: boolean;
  autoplay: boolean;
  session: SessionState | null;
  thinking: ThinkingState | null;
  onChange: (value: CreateSessionInput) => void;
  onCreate: () => void;
  onToggleAutoplay: () => void;
  onAdvance: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-brass/80">
            Match controls
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-paper">
            Stage the room, then let them talk.
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...form, mode: option.value })}
                className={`rounded-[1.4rem] border p-4 text-left transition ${
                  form.mode === option.value
                    ? "border-brass/45 bg-brass/10"
                    : "border-white/10 bg-black/25 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-2xl text-paper">{option.label}</p>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-paper/42">
                    {option.stamp}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-paper/56">{option.note}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ruleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...form, rulesProfile: option.value })}
                className={`rounded-[1.3rem] border p-4 text-left transition ${
                  form.rulesProfile === option.value
                    ? "border-pine/45 bg-pine/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <p className="font-display text-2xl text-paper">{option.label}</p>
                <p className="mt-2 text-sm leading-7 text-paper/56">{option.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <LabeledNumber
              label="White minutes"
              value={String(form.whiteMs / 60000)}
              onChange={(value) =>
                onChange({ ...form, whiteMs: Number(value || 0) * 60000 })
              }
            />
            <LabeledNumber
              label="Black minutes"
              value={String(form.blackMs / 60000)}
              onChange={(value) =>
                onChange({ ...form, blackMs: Number(value || 0) * 60000 })
              }
            />
            <LabeledNumber
              label="Increment seconds"
              value={String(form.incrementMs / 1000)}
              onChange={(value) =>
                onChange({ ...form, incrementMs: Number(value || 0) * 1000 })
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={onCreate}
              className="rounded-full bg-brass px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && !thinking ? "Initializing" : "Start session"}
            </button>
            <button
              type="button"
              disabled={!session || busy || Boolean(session.result)}
              onClick={onAdvance}
              className="rounded-full border border-white/15 px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-paper transition hover:border-brass/45 hover:text-brass disabled:cursor-not-allowed disabled:opacity-35"
            >
              Advance ply
            </button>
          </div>

          <button
            type="button"
            disabled={!session}
            onClick={onToggleAutoplay}
            className="rounded-full border border-pine/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-pine transition hover:bg-pine hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
          >
            {autoplay ? "Pause autoplay" : "Enable autoplay"}
          </button>

          <ThinkingPanel session={session} thinking={thinking} />
        </div>
      </div>
    </section>
  );
}

function BoardStage({
  board,
  lastMove,
  turn,
  whiteProvider,
  blackProvider,
  whiteClock,
  blackClock,
}: {
  board: ReturnType<Chess["board"]>;
  lastMove: SessionState["moves"][number] | null;
  turn: Side;
  whiteProvider: ProviderDescriptor;
  blackProvider: ProviderDescriptor;
  whiteClock: string;
  blackClock: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.45)] md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(196,163,110,0.18),transparent_18%),radial-gradient(circle_at_82%_16%,rgba(61,111,98,0.16),transparent_18%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-paper/42">
              Board stage
            </p>
            <h2 className="mt-3 font-display text-5xl leading-none text-paper">
              Center authority
            </h2>
          </div>
          <p className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-paper/56">
            {capitalize(turn)} to move
          </p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <ClockBanner
            side="White"
            provider={whiteProvider}
            value={whiteClock}
            accent="brass"
            active={turn === "white"}
          />
          <ClockBanner
            side="Black"
            provider={blackProvider}
            value={blackClock}
            accent="pine"
            active={turn === "black"}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative w-full max-w-[52rem] rounded-[2.4rem] border border-[#8d7247]/45 bg-[#110d09] p-3 md:p-5">
            <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_20%,transparent_72%,rgba(255,255,255,0.04))]" />
            <div className="pointer-events-none absolute -inset-x-2 bottom-[-2.2rem] h-16 rounded-full bg-black/45 blur-2xl" />

            <div className="relative rounded-[1.9rem] border border-black/30 bg-[#1f1811] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] md:p-4">
              <div className="grid grid-cols-8 overflow-hidden rounded-[1.35rem] md:rotate-[-1.5deg]">
                {board.flat().map((square, index) => {
                  const rank = 8 - Math.floor(index / 8);
                  const file = "abcdefgh"[index % 8];
                  const coordinate = `${file}${rank}`;
                  const fileIndex = index % 8;
                  const isLight = (rank + fileIndex) % 2 === 0;
                  const highlighted =
                    lastMove?.from === coordinate || lastMove?.to === coordinate;

                  return (
                    <motion.div
                      key={coordinate}
                      layout
                      className={`relative flex aspect-square min-h-[2.9rem] items-center justify-center ${
                        isLight
                          ? "bg-[radial-gradient(circle_at_30%_30%,#e7d7b9,#d7c29d_70%)]"
                          : "bg-[radial-gradient(circle_at_30%_30%,#75563e,#65472f_72%)]"
                      }`}
                      animate={{
                        scale: highlighted ? 1.02 : 1,
                        filter: highlighted ? "brightness(1.06)" : "brightness(1)",
                      }}
                      transition={{ duration: 0.22 }}
                    >
                      <span className="absolute left-1.5 top-1 text-[9px] uppercase tracking-[0.16em] text-black/35 md:left-2 md:top-1.5">
                        {coordinate}
                      </span>
                      {square ? (
                        <ChessPieceToken
                          glyph={PIECES[`${square.color}${square.type}`]}
                          color={square.color}
                        />
                      ) : null}
                      {highlighted ? (
                        <span className="pointer-events-none absolute inset-0 border-2 border-brass/75" />
                      ) : null}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <BoardMetric label="Last move" value={lastMove ? lastMove.san : "Waiting"} />
          <BoardMetric label="UCI" value={lastMove ? lastMove.uci : "--"} />
          <BoardMetric
            label="Promotion"
            value={lastMove?.promotion ?? "None"}
          />
        </div>
      </div>
    </section>
  );
}

function ConversationRail({
  title,
  side,
  provider,
  entries,
  thinking,
  clock,
}: {
  title: string;
  side: Side;
  provider: ProviderDescriptor;
  entries: CommentaryEntry[];
  thinking: ThinkingState | null;
  clock: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur xl:min-h-[46rem]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-paper/42">
            {title}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-paper">
            {provider.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-paper/56">
            {provider.persona}. {provider.signature}.
          </p>
        </div>
        <div className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-paper/55">
          {clock}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:auto-rows-min">
        {entries.length ? (
          entries
            .slice(-6)
            .map((entry) => (
              <ChatBubble
                key={entry.id}
                side={side}
                provider={provider}
                entry={entry}
              />
            ))
        ) : (
          <EmptyChat side={side} />
        )}

        {thinking ? <ThinkingBubble side={side} thinking={thinking} /> : null}
      </div>
    </section>
  );
}

function AnalysisDeck({ session }: { session: SessionState | null }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/25 p-5 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.28em] text-paper/42">
        Match telemetry
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <BoardMetric
          label="Rules profile"
          value={session ? labelRule(session.rulesProfile) : "Not started"}
        />
        <BoardMetric
          label="Legal moves"
          value={session ? String(session.analysis.legalMoves) : "-"}
        />
        <BoardMetric
          label="Repetition count"
          value={session ? String(session.analysis.repetitionCount) : "-"}
        />
        <BoardMetric
          label="Halfmove clock"
          value={session ? String(session.analysis.halfmoveClock) : "-"}
        />
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-paper/40">
          Principal variation
        </p>
        <p className="mt-3 font-display text-3xl text-paper">
          {session?.lastModelRun?.principalVariation.length
            ? session.lastModelRun.principalVariation.join("  ")
            : session?.analysis.principalVariation.length
              ? session.analysis.principalVariation.join("  ")
              : "No line yet"}
        </p>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-paper/62">
        {session?.lastModelRun
          ? `${capitalize(session.lastModelRun.side)} spent ${formatThinking(session.lastModelRun.thinkMs)} in a ${session.lastModelRun.mood} state before responding.`
          : "The board, chat rails, clocks, and events all project the same session state so the match feels unified instead of stitched together."}
      </div>
    </section>
  );
}

function EventPanel({
  events,
  filter,
  onFilterChange,
}: {
  events: SessionState["events"];
  filter: string;
  onFilterChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-paper/42">
            Event stream
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-paper">
            Ordered actions
          </h2>
        </div>
        <input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder="Filter events"
          className="w-full max-w-56 rounded-full border border-white/12 bg-black/25 px-4 py-3 text-sm text-paper outline-none transition focus:border-brass/40"
        />
      </div>

      <div className="mt-6 max-h-[24rem] overflow-auto rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        <div className="grid gap-3">
          {events.length ? (
            events.map((event) => (
              <div
                key={event.seq}
                className="grid gap-2 border-b border-white/8 pb-3 text-sm leading-7 text-paper/72"
              >
                <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-paper/38">
                  <span>{event.type.replaceAll("_", " ")}</span>
                  <span>#{event.seq}</span>
                </div>
                <p>{event.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-paper/55">
              No events match the current filter.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function PGNPanel({ pgn }: { pgn: string }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/25 p-5 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.28em] text-paper/42">
        PGN log
      </p>
      <h2 className="mt-3 font-display text-4xl leading-none text-paper">
        Recorded notation
      </h2>
      <pre className="mt-6 whitespace-pre-wrap rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-paper/70">
        {pgn}
      </pre>
    </section>
  );
}

function ThinkingPanel({
  session,
  thinking,
}: {
  session: SessionState | null;
  thinking: ThinkingState | null;
}) {
  if (thinking) {
    return (
      <div className="rounded-[1.5rem] border border-ember/25 bg-ember/10 p-4 text-sm leading-7 text-paper/80">
        <p className="text-[10px] uppercase tracking-[0.2em] text-paper/45">
          Live thinking
        </p>
        <p className="mt-2 font-display text-3xl text-paper">
          {capitalize(thinking.side)} is thinking
        </p>
        <p className="mt-2">{thinking.message}</p>
        <p className="mt-2 text-paper/56">
          Simulated think time: {formatThinking(thinking.thinkMs)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-paper/62">
      <p className="text-[10px] uppercase tracking-[0.2em] text-paper/42">
        Timing posture
      </p>
      <p className="mt-2">
        {session?.upcomingThinkMs
          ? `Next turn is staged with about ${formatThinking(session.upcomingThinkMs)} of visible thinking time.`
          : "Start a session to stage live thinking and chat reactions."}
      </p>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-paper/38">{label}</p>
      <p className="mt-3 font-display text-3xl leading-none text-paper">{value}</p>
    </div>
  );
}

function BoardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-paper/38">{label}</p>
      <p className="mt-3 font-display text-3xl leading-none text-paper">{value}</p>
    </div>
  );
}

function ClockBanner({
  side,
  provider,
  value,
  accent,
  active,
}: {
  side: string;
  provider: ProviderDescriptor;
  value: string;
  accent: "brass" | "pine";
  active: boolean;
}) {
  const accentClasses =
    accent === "brass"
      ? "border-brass/35 bg-brass/8"
      : "border-pine/35 bg-pine/10";

  return (
    <div
      className={`rounded-[1.7rem] border p-4 ${accentClasses} ${
        active ? "shadow-[0_0_0_1px_rgba(244,239,227,0.06)]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-paper/48">{side}</p>
          <p className="mt-2 text-sm leading-6 text-paper/58">{provider.name}</p>
        </div>
        <p className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none text-paper">
          {value}
        </p>
      </div>
    </div>
  );
}

function ChessPieceToken({
  glyph,
  color,
}: {
  glyph: string;
  color: "w" | "b";
}) {
  const isWhite = color === "w";

  return (
    <div className="relative flex h-[84%] w-[84%] items-center justify-center">
      <div
        className={`absolute inset-[12%] rounded-full ${
          isWhite
            ? "bg-[radial-gradient(circle_at_35%_30%,#fffef8,#d5d1c6_72%,#9d9482)]"
            : "bg-[radial-gradient(circle_at_35%_30%,#55606c,#1d2329_72%,#060708)]"
        } shadow-[0_10px_16px_rgba(0,0,0,0.26)]`}
      />
      <div className="absolute inset-[18%] rounded-full border border-white/15" />
      <span
        className={`relative text-[clamp(1.6rem,3.4vw,3.1rem)] leading-none ${
          isWhite ? "text-[#574735]" : "text-[#f1e7d4]"
        } drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]`}
      >
        {glyph}
      </span>
    </div>
  );
}

function ChatBubble({
  side,
  provider,
  entry,
}: {
  side: Side;
  provider: ProviderDescriptor;
  entry: CommentaryEntry;
}) {
  const isWhite = side === "white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative rounded-[1.5rem] border p-4 text-sm leading-7 ${
        isWhite
          ? "border-brass/25 bg-brass/6 text-paper/76"
          : "border-pine/25 bg-pine/10 text-paper/76"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-paper/42">
          {provider.name}
        </p>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-paper/46">
          {entry.mood}
        </span>
      </div>
      <p className="mt-3">{entry.text}</p>
    </motion.div>
  );
}

function ThinkingBubble({
  side,
  thinking,
}: {
  side: Side;
  thinking: ThinkingState;
}) {
  const isWhite = side === "white";

  return (
    <motion.div
      initial={{ opacity: 0.55, y: 10 }}
      animate={{ opacity: [0.55, 1, 0.55], y: [10, 0, 10] }}
      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
      className={`rounded-[1.5rem] border p-4 text-sm leading-7 ${
        isWhite
          ? "border-brass/25 bg-brass/8 text-paper/80"
          : "border-pine/25 bg-pine/12 text-paper/80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-paper/45">
          Thinking
        </p>
        <span className="text-[10px] uppercase tracking-[0.18em] text-paper/42">
          {formatThinking(thinking.thinkMs)}
        </span>
      </div>
      <p className="mt-3">{thinking.message}</p>
    </motion.div>
  );
}

function EmptyChat({ side }: { side: Side }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-sm leading-7 text-paper/56">
      {capitalize(side)} has not spoken yet. Start a session and the side rail will fill with live
      move reactions.
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-3 text-sm text-paper/70">
      <span className="text-[11px] uppercase tracking-[0.22em] text-paper/42">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base text-paper outline-none transition focus:border-brass/40"
      />
    </label>
  );
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function previewProvider(mode: CreateSessionInput["mode"], side: Side): ProviderDescriptor {
  if (mode === "cloud_vs_cloud") {
    return side === "white"
      ? {
          id: "gemini_flash",
          name: "Gemini 2.5 Flash",
          runtime: "cloud",
          model: "gemini-2.5-flash",
          style: "fast and assertive",
          persona: "sharp speed-chess trash talker",
          signature: "clean, fast, a little smug",
          baseThinkMs: 1300,
          varianceMs: 650,
        }
      : {
          id: "gemini_pro",
          name: "Gemini 2.5 Pro",
          runtime: "cloud",
          model: "gemini-2.5-pro",
          style: "measured and strategic",
          persona: "calm elite technician",
          signature: "cold, precise, quietly superior",
          baseThinkMs: 1800,
          varianceMs: 900,
        };
  }

  if (mode === "cloud_vs_local") {
    return side === "white"
      ? {
          id: "gemini_flash",
          name: "Gemini 2.5 Flash",
          runtime: "cloud",
          model: "gemini-2.5-flash",
          style: "fast and assertive",
          persona: "sharp speed-chess trash talker",
          signature: "clean, fast, a little smug",
          baseThinkMs: 1300,
          varianceMs: 650,
        }
      : {
          id: "ollama_primary",
          name: "Ollama Primary",
          runtime: "local",
          model: "qwen3:8b",
          style: "practical and stubborn",
          persona: "solid club grinder with dry humor",
          signature: "annoyingly resilient",
          baseThinkMs: 850,
          varianceMs: 500,
        };
  }

  return side === "white"
    ? {
        id: "ollama_primary",
        name: "Ollama Primary",
        runtime: "local",
        model: "qwen3:8b",
        style: "practical and stubborn",
        persona: "solid club grinder with dry humor",
        signature: "annoyingly resilient",
        baseThinkMs: 850,
        varianceMs: 500,
      }
    : {
        id: "lmstudio_fallback",
        name: "LM Studio Fallback",
        runtime: "local",
        model: "local-model",
        style: "creative but less stable",
        persona: "chaotic improviser",
        signature: "emotional, funny, unpredictable",
        baseThinkMs: 1100,
        varianceMs: 700,
      };
}

function buildThinkingLine(provider: ProviderDescriptor, side: Side) {
  const lines =
    side === "white"
      ? [
          `${provider.name} is cooking something annoying.`,
          `${provider.name} is staring at the center like it owes rent.`,
          `${provider.name} is pretending this is easy.`,
        ]
      : [
          `${provider.name} is looking for a comeback angle.`,
          `${provider.name} is deciding how rude to be.`,
          `${provider.name} is running the board one more time.`,
        ];

  return lines[(provider.baseThinkMs + provider.varianceMs) % lines.length];
}

function formatClock(value: number) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatThinking(value: number) {
  return `${(value / 1000).toFixed(1)}s`;
}

function clampThinkingDelay(value: number) {
  return Math.max(700, Math.min(value, 2300));
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function describeStatus(session: SessionState) {
  if (session.result) {
    return describeResult(session.result);
  }

  return `${capitalize(session.turn)} to move`;
}

function describeResult(result: NonNullable<SessionState["result"]>) {
  if (result.outcome === "draw") {
    return `Draw by ${result.reason.replaceAll("_", " ")}`;
  }

  return `${capitalize(result.winner ?? "white")} won by ${result.reason.replaceAll("_", " ")}`;
}

function labelRule(value: SessionState["rulesProfile"] | CreateSessionInput["rulesProfile"]) {
  return value === "strict_fide" ? "Strict FIDE" : "Practical app";
}

function labelMode(value: SessionState["mode"] | CreateSessionInput["mode"]) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
