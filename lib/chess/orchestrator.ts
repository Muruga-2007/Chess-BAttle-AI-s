import { Chess } from "chess.js";
import { randomUUID } from "crypto";
import {
  chooseProviderDecision,
  getModeProviders,
  getProviderThinkTime,
} from "@/lib/chess/providers";
import type {
  AnalysisSnapshot,
  ClaimState,
  CommentaryEntry,
  CreateSessionInput,
  EventEntry,
  LastMoveSnapshot,
  ProviderDescriptor,
  ProviderId,
  SessionResult,
  SessionState,
  Side,
  ModelRunSnapshot,
} from "@/lib/chess/types";

type SessionRecord = {
  id: string;
  mode: CreateSessionInput["mode"];
  rulesProfile: CreateSessionInput["rulesProfile"];
  createdAt: string;
  updatedAt: string;
  whiteMs: number;
  blackMs: number;
  incrementMs: number;
  whiteProvider: ProviderDescriptor;
  blackProvider: ProviderDescriptor;
  chess: Chess;
  events: EventEntry[];
  commentary: CommentaryEntry[];
  moves: LastMoveSnapshot[];
  lastModelRun: ModelRunSnapshot | null;
  result: SessionResult | null;
  repetitionCount: Map<string, number>;
};

export function createSessionRecord(input: CreateSessionInput): SessionRecord {
  const now = new Date().toISOString();
  const { white, black } = getModeProviders(input.mode);
  const chess = new Chess();
  const repetitionCount = new Map<string, number>();
  repetitionCount.set(positionKey(chess.fen()), 1);

  const record: SessionRecord = {
    id: randomUUID(),
    mode: input.mode,
    rulesProfile: input.rulesProfile,
    createdAt: now,
    updatedAt: now,
    whiteMs: input.whiteMs,
    blackMs: input.blackMs,
    incrementMs: input.incrementMs,
    whiteProvider: white,
    blackProvider: black,
    chess,
    events: [],
    commentary: [],
    moves: [],
    lastModelRun: null,
    result: null,
    repetitionCount,
  };

  pushEvent(record, "session_created", `Session opened in ${input.mode} with ${input.rulesProfile}.`);
  return record;
}

export function advanceRecord(record: SessionRecord): SessionRecord {
  if (record.result) {
    return record;
  }

  const side = toSide(record.chess.turn());
  const provider = side === "white" ? record.whiteProvider : record.blackProvider;
  const claimState = computeClaimState(record);

  if (claimState.fivefold) {
    finalize(record, {
      outcome: "draw",
      reason: "fivefold_repetition",
      winner: null,
    });
    pushEvent(record, "draw_auto", "Automatic draw applied from fivefold repetition.");
    return record;
  }

  if (claimState.seventyFiveMove) {
    finalize(record, {
      outcome: "draw",
      reason: "seventy_five_move_rule",
      winner: null,
    });
    pushEvent(record, "draw_auto", "Automatic draw applied from the 75-move rule.");
    return record;
  }

  const thinkMs = getClock(record, side);
  const decision = chooseProviderDecision(record.chess, provider.id as ProviderId, {
    side,
    moveNumber: record.moves.length + 1,
    rulesProfile: record.rulesProfile,
    claimState,
    evaluationHint: buildAnalysis(record).evaluationCp,
  });

  if (thinkMs - decision.thinkMs <= 0) {
    finalize(record, {
      outcome: side === "white" ? "black_win" : "white_win",
      reason: "timeout",
      winner: side === "white" ? "black" : "white",
    });
    pushEvent(record, "game_finished", `${provider.name} lost on time before completing a move.`);
    return record;
  }

  setClock(record, side, thinkMs - decision.thinkMs + record.incrementMs);
  pushEvent(record, "clock_updated", `${capitalize(side)} clock updated after ${provider.name} consumed ${decision.thinkMs} ms.`);

  if (decision.action === "claim_draw") {
    const result = claimResult(record, claimState);

    if (result) {
      appendCommentary(record, side, provider.name, decision.commentary, decision.mood);
      record.lastModelRun = {
        side,
        provider: provider.name,
        action: "claim_draw",
        thinkMs: decision.thinkMs,
        evaluationCp: null,
        mood: decision.mood,
        principalVariation: [],
      };
      pushEvent(record, "draw_claimed", `${provider.name} claimed a draw under ${record.rulesProfile}.`);
      finalize(record, result);
      return record;
    }

    throw new Error("Provider attempted an invalid draw claim");
  }

  const appliedMove = record.chess.move({
    from: decision.move.from,
    to: decision.move.to,
    promotion: decision.move.promotion,
  });

  record.moves.push({
    uci: `${appliedMove.from}${appliedMove.to}${appliedMove.promotion ?? ""}`,
    san: appliedMove.san,
    from: appliedMove.from,
    to: appliedMove.to,
    promotion: appliedMove.promotion ?? null,
  });

  incrementRepetition(record);
  appendCommentary(record, side, provider.name, decision.commentary, decision.mood);
  record.lastModelRun = {
    side,
    provider: provider.name,
    action: "move",
    thinkMs: decision.thinkMs,
    evaluationCp: decision.evaluationCp,
    mood: decision.mood,
    principalVariation: decision.principalVariation,
  };
  pushEvent(
    record,
    "model_response",
    `${provider.name} proposed ${appliedMove.san} with evaluation ${decision.evaluationCp} cp.`,
  );
  pushEvent(record, "move_committed", `${capitalize(side)} committed ${appliedMove.san}.`);

  const result = inferResult(record);
  if (result) {
    finalize(record, result);
  }

  return record;
}

export function serializeRecord(record: SessionRecord): SessionState {
  const claimState = computeClaimState(record);

  return {
    id: record.id,
    mode: record.mode,
    rulesProfile: record.rulesProfile,
    status: record.result ? "finished" : "active",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    fen: record.chess.fen(),
    pgn: record.chess.pgn(),
    ply: record.moves.length,
    turn: toSide(record.chess.turn()),
    whiteMs: record.whiteMs,
    blackMs: record.blackMs,
    incrementMs: record.incrementMs,
    whiteProvider: record.whiteProvider,
    blackProvider: record.blackProvider,
    claimState,
    analysis: buildAnalysis(record),
    commentary: record.commentary,
    events: record.events,
    moves: record.moves,
    lastModelRun: record.lastModelRun,
    upcomingThinkMs: record.result
      ? null
      : getProviderThinkTime(
          (record.chess.turn() === "w"
            ? record.whiteProvider.id
            : record.blackProvider.id) as ProviderId,
          record.moves.length + 1,
        ),
    result: record.result,
  };
}

function inferResult(record: SessionRecord): SessionResult | null {
  if (record.chess.isCheckmate()) {
    return {
      outcome: record.chess.turn() === "w" ? "black_win" : "white_win",
      reason: "checkmate",
      winner: record.chess.turn() === "w" ? "black" : "white",
    };
  }

  if (record.chess.isStalemate()) {
    return {
      outcome: "draw",
      reason: "stalemate",
      winner: null,
    };
  }

  if (record.chess.isInsufficientMaterial()) {
    return {
      outcome: "draw",
      reason: "insufficient_material",
      winner: null,
    };
  }

  return null;
}

function claimResult(record: SessionRecord, claimState: ClaimState): SessionResult | null {
  if (claimState.threefold) {
    return {
      outcome: "draw",
      reason: "threefold_claim",
      winner: null,
    };
  }

  if (claimState.fiftyMove) {
    return {
      outcome: "draw",
      reason: "fifty_move_claim",
      winner: null,
    };
  }

  return null;
}

function finalize(record: SessionRecord, result: SessionResult) {
  record.result = result;
  record.updatedAt = new Date().toISOString();
  pushEvent(
    record,
    "game_finished",
    result.outcome === "draw"
      ? `Game finished as a draw by ${result.reason}.`
      : `${capitalize(result.winner ?? "white")} won by ${result.reason}.`,
  );
}

function appendCommentary(
  record: SessionRecord,
  side: Side,
  provider: string,
  text: string,
  mood: string,
) {
  record.commentary.push({
    id: randomUUID(),
    side,
    provider,
    text,
    mood,
    visibility: "public",
    timestamp: new Date().toISOString(),
  });
  record.updatedAt = new Date().toISOString();
}

function pushEvent(record: SessionRecord, type: EventEntry["type"], summary: string) {
  record.events.push({
    seq: record.events.length + 1,
    type,
    summary,
    timestamp: new Date().toISOString(),
  });
  record.updatedAt = new Date().toISOString();
}

function incrementRepetition(record: SessionRecord) {
  const key = positionKey(record.chess.fen());
  record.repetitionCount.set(key, (record.repetitionCount.get(key) ?? 0) + 1);
}

function buildAnalysis(record: SessionRecord): AnalysisSnapshot {
  const legalMoves = record.chess.moves({ verbose: true });
  const halfmoveClock = halfmoveField(record.chess.fen());
  const repetition = record.repetitionCount.get(positionKey(record.chess.fen())) ?? 1;

  const principalVariation = legalMoves
    .slice(0, 3)
    .map((move) => `${move.from}${move.to}${move.promotion ?? ""}`);

  const evaluationCp = evaluateMaterial(record.chess) * (record.chess.turn() === "w" ? 1 : -1);

  return {
    evaluationCp,
    legalMoves: legalMoves.length,
    repetitionCount: repetition,
    halfmoveClock,
    principalVariation,
  };
}

function evaluateMaterial(chess: Chess) {
  const values = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 0,
  } as const;

  let score = 0;

  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }

      score += piece.color === "w" ? values[piece.type] : -values[piece.type];
    }
  }

  return score;
}

function computeClaimState(record: SessionRecord): ClaimState {
  const key = positionKey(record.chess.fen());
  const repetition = record.repetitionCount.get(key) ?? 1;
  const halfmoveClock = halfmoveField(record.chess.fen());

  return {
    threefold: repetition >= 3 || record.chess.isThreefoldRepetition(),
    fivefold: repetition >= 5,
    fiftyMove: halfmoveClock >= 100 || record.chess.isDrawByFiftyMoves(),
    seventyFiveMove: halfmoveClock >= 150,
  };
}

function positionKey(fen: string) {
  return fen.split(" ").slice(0, 4).join(" ");
}

function halfmoveField(fen: string) {
  return Number.parseInt(fen.split(" ")[4] ?? "0", 10);
}

function toSide(color: string): Side {
  return color === "w" ? "white" : "black";
}

function getClock(record: SessionRecord, side: Side) {
  return side === "white" ? record.whiteMs : record.blackMs;
}

function setClock(record: SessionRecord, side: Side, value: number) {
  if (side === "white") {
    record.whiteMs = value;
    return;
  }

  record.blackMs = value;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
