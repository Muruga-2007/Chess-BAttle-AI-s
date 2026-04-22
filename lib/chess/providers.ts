import { Chess, type Color, type Move } from "chess.js";
import type {
  ClaimState,
  ProviderDescriptor,
  ProviderId,
  RulesProfile,
  Side,
} from "@/lib/chess/types";

type ProviderProfile = ProviderDescriptor & {
  risk: number;
  claimMarginCp: number;
};

type SelectionContext = {
  side: Side;
  moveNumber: number;
  rulesProfile: RulesProfile;
  claimState: ClaimState;
  evaluationHint: number;
};

export type ProviderDecision =
  | {
      action: "claim_draw";
      commentary: string;
      thinkMs: number;
      mood: string;
    }
  | {
      action: "move";
      move: Move;
      commentary: string;
      thinkMs: number;
      principalVariation: string[];
      evaluationCp: number;
      mood: string;
    };

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
} as const;

const PROVIDERS: Record<ProviderId, ProviderProfile> = {
  gemini_flash: {
    id: "gemini_flash",
    name: "Gemini 2.5 Flash",
    runtime: "cloud",
    model: process.env.GEMINI_FLASH_MODEL || "gemini-2.5-flash",
    style: "fast and assertive",
    persona: "sharp speed-chess trash talker",
    signature: "clean, fast, a little smug",
    baseThinkMs: 1300,
    varianceMs: 650,
    risk: 1.6,
    claimMarginCp: -80,
  },
  gemini_pro: {
    id: "gemini_pro",
    name: "Gemini 2.5 Pro",
    runtime: "cloud",
    model: process.env.GEMINI_PRO_MODEL || "gemini-2.5-pro",
    style: "measured and strategic",
    persona: "calm elite technician",
    signature: "cold, precise, quietly superior",
    baseThinkMs: 1800,
    varianceMs: 900,
    risk: 0.9,
    claimMarginCp: -30,
  },
  ollama_primary: {
    id: "ollama_primary",
    name: "Ollama Primary",
    runtime: "local",
    model: process.env.OLLAMA_MODEL || "qwen3:8b",
    style: "practical and stubborn",
    persona: "solid club grinder with dry humor",
    signature: "annoyingly resilient",
    baseThinkMs: 850,
    varianceMs: 500,
    risk: 1.2,
    claimMarginCp: -60,
  },
  lmstudio_fallback: {
    id: "lmstudio_fallback",
    name: "LM Studio Fallback",
    runtime: "local",
    model: process.env.LM_STUDIO_MODEL || "local-model",
    style: "creative but less stable",
    persona: "chaotic improviser",
    signature: "emotional, funny, unpredictable",
    baseThinkMs: 1100,
    varianceMs: 700,
    risk: 2.3,
    claimMarginCp: -100,
  },
};

const OPENING_LINES = [
  "I'm not rushing. I'm just seeing it quicker than you.",
  "Small move, big problem later.",
  "Calm start. Pressure first, panic later.",
  "That square was asking for me.",
];

const CAPTURE_LINES = [
  "Free material is free material. I took it.",
  "You left that hanging. I'm not a saint.",
  "Thanks for the donation. I'll keep it.",
  "That piece looked lonely. I fixed that.",
];

const CHECK_LINES = [
  "Check. Breathe if you can.",
  "Check. Your king is in my notifications now.",
  "Check. That got personal quickly.",
  "Check. This is where the room gets quiet.",
];

const CASTLE_LINES = [
  "I castle. Adult decisions only.",
  "King safe, hands free, business starts now.",
  "Boring move. Excellent move.",
  "I tucked the king away. Now the fun part.",
];

const PROMOTION_LINES = [
  "Queen time. Let's stop pretending this was subtle.",
  "Promotion. That's the whole argument right there.",
  "New queen on the board. This should age badly for you.",
  "I made a queen. That feels appropriately rude.",
];

const WINNING_LINES = [
  "Position says I'm better, and honestly it looks that way.",
  "This is starting to feel one-sided.",
  "I'm pressing because the board is already leaning my way.",
  "The edges are clean now. You feel that, right?",
];

const LOSING_LINES = [
  "Not ideal, but I'm still here and still annoying.",
  "Ugly position. Fine. We pivot.",
  "I'm worse, not finished.",
  "This is defensive work now. I can live with that.",
];

const NEUTRAL_LINES = [
  "Still balanced. I'm choosing discomfort over drama.",
  "No fireworks yet. Just better squares.",
  "Quiet move. Real point.",
  "Stable position, unstable future.",
];

const CLAIM_LINES = [
  "I'm claiming the draw. No need to cosplay chaos here.",
  "Draw claim. We have reached the part where accuracy beats ego.",
  "I can press nonsense or claim properly. I'm claiming properly.",
  "Draw claim. Call it discipline.",
];

export function getProvider(id: ProviderId): ProviderDescriptor {
  return PROVIDERS[id];
}

export function getModeProviders(mode: string): {
  white: ProviderDescriptor;
  black: ProviderDescriptor;
} {
  switch (mode) {
    case "cloud_vs_cloud":
      return {
        white: getProvider("gemini_flash"),
        black: getProvider("gemini_pro"),
      };
    case "cloud_vs_local":
      return {
        white: getProvider("gemini_flash"),
        black: getProvider("ollama_primary"),
      };
    case "local_vs_local":
    default:
      return {
        white: getProvider("ollama_primary"),
        black: getProvider("lmstudio_fallback"),
      };
  }
}

export function getProviderThinkTime(providerId: ProviderId, moveNumber: number) {
  const provider = PROVIDERS[providerId];
  return provider.baseThinkMs + ((moveNumber * 137) % provider.varianceMs);
}

export function chooseProviderDecision(
  chess: Chess,
  providerId: ProviderId,
  context: SelectionContext,
): ProviderDecision {
  const provider = PROVIDERS[providerId];
  const thinkMs = getProviderThinkTime(providerId, context.moveNumber);
  const legalMoves = chess.moves({ verbose: true });
  const color: Color = context.side === "white" ? "w" : "b";

  const scoredMoves = legalMoves
    .map((move) => {
      const next = new Chess(chess.fen());
      next.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      return {
        move,
        score: scorePosition(next, color, move),
      };
    })
    .sort((left, right) => right.score - left.score);

  const bestScore = scoredMoves[0]?.score ?? 0;
  const chosenIndex = Math.min(
    scoredMoves.length - 1,
    Math.max(
      0,
      Math.floor((context.moveNumber % 3) * provider.risk) %
        Math.min(3, scoredMoves.length || 1),
    ),
  );
  const choice = scoredMoves[Math.max(0, chosenIndex)] ?? null;
  const evaluationCp = Math.round(bestScore);

  if (
    context.rulesProfile === "practical_app" &&
    (context.claimState.threefold || context.claimState.fiftyMove) &&
    Math.abs(evaluationCp) < 60
  ) {
    return {
      action: "claim_draw",
      thinkMs,
      mood: "disciplined",
      commentary: buildClaimCommentary(provider, context.moveNumber),
    };
  }

  if (
    context.rulesProfile === "strict_fide" &&
    (context.claimState.threefold || context.claimState.fiftyMove) &&
    evaluationCp <= provider.claimMarginCp
  ) {
    return {
      action: "claim_draw",
      thinkMs,
      mood: "pragmatic",
      commentary: buildClaimCommentary(provider, context.moveNumber),
    };
  }

  if (!choice) {
    throw new Error("No legal moves available for provider decision");
  }

  const mood = inferMood(choice.move, evaluationCp, context.evaluationHint);

  return {
    action: "move",
    move: choice.move,
    thinkMs,
    commentary: buildMoveCommentary(
      provider,
      choice.move,
      context.moveNumber,
      evaluationCp,
      mood,
    ),
    principalVariation: scoredMoves.slice(0, 3).map(({ move }) => toUci(move)),
    evaluationCp,
    mood,
  };
}

function scorePosition(chess: Chess, sideToOptimize: Color, move: Move) {
  if (chess.isCheckmate()) {
    return 100_000;
  }

  let score = materialScore(chess, sideToOptimize);

  if (move.isCapture()) {
    score += 40 + PIECE_VALUES[move.captured ?? "p"];
  }

  if (move.isPromotion()) {
    score += 700;
  }

  if (chess.isCheck()) {
    score += 35;
  }

  if (["d4", "e4", "d5", "e5"].includes(move.to)) {
    score += 18;
  }

  if (move.piece === "n" || move.piece === "b") {
    score += 8;
  }

  return score;
}

function materialScore(chess: Chess, sideToOptimize: Color) {
  let score = 0;

  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }

      const delta = PIECE_VALUES[piece.type];
      score += piece.color === sideToOptimize ? delta : -delta;
    }
  }

  return score;
}

function buildMoveCommentary(
  provider: ProviderProfile,
  move: Move,
  moveNumber: number,
  evaluationCp: number,
  mood: string,
) {
  const opening = pick(OPENING_LINES, moveNumber + provider.baseThinkMs);

  let core = pick(NEUTRAL_LINES, moveNumber + move.san.length);

  if (move.isCapture()) {
    core = pick(CAPTURE_LINES, moveNumber + 7);
  } else if (move.isPromotion()) {
    core = pick(PROMOTION_LINES, moveNumber + 11);
  } else if (move.isKingsideCastle() || move.isQueensideCastle()) {
    core = pick(CASTLE_LINES, moveNumber + 13);
  } else if (move.san.includes("+")) {
    core = pick(CHECK_LINES, moveNumber + 17);
  } else if (evaluationCp > 140) {
    core = pick(WINNING_LINES, moveNumber + 19);
  } else if (evaluationCp < -100) {
    core = pick(LOSING_LINES, moveNumber + 23);
  }

  return `${move.san}. ${opening} ${provider.signature}. ${core}`;
}

function buildClaimCommentary(provider: ProviderProfile, moveNumber: number) {
  return `${pick(CLAIM_LINES, moveNumber + provider.baseThinkMs)} ${provider.signature}.`;
}

function inferMood(move: Move, evaluationCp: number, previousEval: number) {
  if (move.isPromotion()) {
    return "victorious";
  }

  if (move.san.includes("+")) {
    return "predatory";
  }

  if (move.isCapture()) {
    return "amused";
  }

  if (evaluationCp - previousEval > 80) {
    return "confident";
  }

  if (evaluationCp < -80) {
    return "stubborn";
  }

  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    return "composed";
  }

  return "focused";
}

function pick(values: string[], seed: number) {
  return values[Math.abs(seed) % values.length];
}

function toUci(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}
