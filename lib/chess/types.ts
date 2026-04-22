export type GameMode = "cloud_vs_cloud" | "cloud_vs_local" | "local_vs_local";

export type RulesProfile = "strict_fide" | "practical_app";

export type Side = "white" | "black";

export type RuntimeKind = "cloud" | "local";

export type ProviderId =
  | "gemini_flash"
  | "gemini_pro"
  | "ollama_primary"
  | "lmstudio_fallback";

export type GameStatus = "idle" | "active" | "finished";

export type ResultReason =
  | "checkmate"
  | "stalemate"
  | "threefold_claim"
  | "fivefold_repetition"
  | "fifty_move_claim"
  | "seventy_five_move_rule"
  | "insufficient_material"
  | "timeout"
  | "resignation";

export type GameOutcome = "white_win" | "black_win" | "draw";

export type EventType =
  | "session_created"
  | "move_committed"
  | "draw_claimed"
  | "draw_auto"
  | "game_finished"
  | "clock_updated"
  | "model_response";

export type Visibility = "public" | "debug";

export type ProviderDescriptor = {
  id: ProviderId;
  name: string;
  runtime: RuntimeKind;
  model: string;
  style: string;
  persona: string;
  signature: string;
  baseThinkMs: number;
  varianceMs: number;
};

export type EventEntry = {
  seq: number;
  type: EventType;
  timestamp: string;
  summary: string;
};

export type CommentaryEntry = {
  id: string;
  side: Side;
  provider: string;
  text: string;
  mood: string;
  visibility: Visibility;
  timestamp: string;
};

export type ModelRunSnapshot = {
  side: Side;
  provider: string;
  action: "move" | "claim_draw";
  thinkMs: number;
  evaluationCp: number | null;
  mood: string;
  principalVariation: string[];
};

export type ClaimState = {
  threefold: boolean;
  fivefold: boolean;
  fiftyMove: boolean;
  seventyFiveMove: boolean;
};

export type AnalysisSnapshot = {
  evaluationCp: number;
  legalMoves: number;
  repetitionCount: number;
  halfmoveClock: number;
  principalVariation: string[];
};

export type LastMoveSnapshot = {
  uci: string;
  san: string;
  from: string;
  to: string;
  promotion: string | null;
};

export type SessionResult = {
  outcome: GameOutcome;
  reason: ResultReason;
  winner: Side | null;
};

export type SessionState = {
  id: string;
  mode: GameMode;
  rulesProfile: RulesProfile;
  status: GameStatus;
  createdAt: string;
  updatedAt: string;
  fen: string;
  pgn: string;
  ply: number;
  turn: Side;
  whiteMs: number;
  blackMs: number;
  incrementMs: number;
  whiteProvider: ProviderDescriptor;
  blackProvider: ProviderDescriptor;
  claimState: ClaimState;
  analysis: AnalysisSnapshot;
  commentary: CommentaryEntry[];
  events: EventEntry[];
  moves: LastMoveSnapshot[];
  lastModelRun: ModelRunSnapshot | null;
  upcomingThinkMs: number | null;
  result: SessionResult | null;
};

export type CreateSessionInput = {
  mode: GameMode;
  rulesProfile: RulesProfile;
  whiteMs: number;
  blackMs: number;
  incrementMs: number;
};
