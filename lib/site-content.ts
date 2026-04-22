export const siteMeta = {
  title: "Chess Local Cloud",
  subtitle:
    "A FIDE-aware, multi-model chess system where deterministic rules stay authoritative and local/cloud engines compete around them.",
  description:
    "A cinematic product site built from the deep research report for a FIDE-compliant multi-model chess application spanning Gemini, Ollama, LM Studio, and Stockfish.",
};

export const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/play", label: "Play" },
  { href: "/architecture", label: "Architecture" },
  { href: "/rules", label: "Rules" },
  { href: "/deployment", label: "Deployment" },
  { href: "/roadmap", label: "Roadmap" },
];

export const heroStats = [
  { label: "Default build mode", value: "Gemini vs local" },
  { label: "Rules posture", value: "Strict FIDE + practical app profiles" },
  { label: "Primary local runtime", value: "Ollama" },
  { label: "Analysis layer", value: "Stockfish + event log" },
];

export const keyPrinciples = [
  {
    title: "Authoritative rules first",
    text: "Moves never become official because an LLM produced them. They become official only after the rules service validates legality, clocks, draw semantics, and result precedence.",
  },
  {
    title: "Interchangeable model adapters",
    text: "Gemini, Ollama, and LM Studio all sit outside the orchestration core. That keeps cloud and local models replaceable without rewriting the chess system itself.",
  },
  {
    title: "Visible orchestration",
    text: "The UI should feel dramatic, but the server still owns the timeline. Commentary, board motion, and clocks all project the same ordered event stream.",
  },
];

export const operatingModes = [
  {
    name: "Gemini vs Gemini",
    verdict: "Best polished demo",
    latency: "~0.8-3.0 s per move",
    privacy: "Lowest privacy posture of the three",
    note: "Simplest operations model and the fastest path to a polished cloud-only showcase.",
  },
  {
    name: "Gemini vs local",
    verdict: "Best overall balance",
    latency: "~0.5-2.5 s local, ~0.8-3.0 s cloud",
    privacy: "Mixed local/cloud posture",
    note: "Exercises both adapters, limits token cost, and surfaces orchestration issues earlier than a pure cloud build.",
  },
  {
    name: "Local vs local",
    verdict: "Best privacy and offline story",
    latency: "~0.3-3.0 s on strong GPUs",
    privacy: "Strongest privacy posture",
    note: "Operationally clean once tuned, but hardware pressure rises sharply with two concurrent local models and long commentary contexts.",
  },
];

export const architectureFlow = [
  "Web UI with 3D board and left/right commentary panes",
  "Session API coordinating move requests and observer updates",
  "Deterministic orchestrator controlling timing, retries, and event order",
  "Authoritative rules service validating chess semantics and claims",
  "Model adapters for Gemini, Ollama, and LM Studio",
  "Stockfish analysis service for evaluation and candidate ranking",
  "Event log, PGN persistence, and ordered outbound event stream",
];

export const architectureRoles = [
  {
    component: "Rules service",
    role: "Legal move validation, draw claims, clocks, and results",
  },
  {
    component: "Stockfish",
    role: "Evaluation, candidate ranking, principal variation, and sanity checks",
  },
  {
    component: "Gemini 2.5 Flash",
    role: "Fast cloud player and commentator",
  },
  {
    component: "Gemini 2.5 Pro",
    role: "Premium deeper-reasoning cloud side",
  },
  {
    component: "Ollama",
    role: "Primary local inference runtime with structured outputs and tool calling",
  },
  {
    component: "LM Studio",
    role: "Secondary local runtime and OpenAI-compatible fallback",
  },
  {
    component: "Ordered event stream",
    role: "Keeps UI animation, clocks, and commentary synchronized",
  },
];

export const ruleNarratives = [
  {
    title: "Preventive legality",
    text: "Illegal model output should be rejected before commit. Tournament-emulation mode can exist, but it is different semantics and should never be the default behavior.",
  },
  {
    title: "Exact state preservation",
    text: "Repetition correctness depends on more than piece placement. Castling rights, en passant state, and full move history all need to survive in canonical server state.",
  },
  {
    title: "Claimable vs automatic draws",
    text: "Threefold repetition and the 50-move rule are claim-based under strict FIDE logic; fivefold repetition, 75 moves, stalemate, and dead positions remain automatic.",
  },
  {
    title: "Server-authoritative clocks",
    text: "The server flips clocks when it commits a move. UI animation can lag slightly for polish, but it must never become the source of official game state.",
  },
];

export const rulesComparison = [
  {
    area: "Invalid move proposal",
    strict: "Reject before commit unless explicitly emulating completed illegal moves",
    practical: "Reject before commit",
  },
  {
    area: "Threefold repetition",
    strict: "Claimable only",
    practical: "Server may surface or auto-claim",
  },
  {
    area: "50-move rule",
    strict: "Claimable only",
    practical: "Server may surface or auto-claim",
  },
  {
    area: "Fivefold repetition",
    strict: "Automatic draw",
    practical: "Automatic draw",
  },
  {
    area: "75-move rule",
    strict: "Automatic draw",
    practical: "Automatic draw",
  },
  {
    area: "Promotion",
    strict: "Explicit promotion piece required",
    practical: "Explicit promotion piece required",
  },
  {
    area: "Quickplay adjudication",
    strict: "Only when event profile enables no-increment guideline",
    practical: "Usually disabled",
  },
  {
    area: "Display authority",
    strict: "Informational only",
    practical: "Informational only",
  },
];

export const contractExamples = {
  moveRequest: `{
  "type": "move_request",
  "game_id": "g_123",
  "ply": 27,
  "side": "white",
  "fen": "r2q1rk1/p2bbppp/Q7/2p1P2P/8/2p1B3/PPP2P1P/2KR3R w - - 0 17",
  "clock": {
    "white_ms": 185233,
    "black_ms": 191004,
    "increment_ms": 2000
  },
  "legal_actions": ["move", "claim_draw", "offer_draw", "resign"],
  "stockfish": {
    "eval_cp": 23,
    "pv": ["h5h6", "g7g6", "a6c4"]
  },
  "ui_context": {
    "persona": "confident-grandmaster",
    "commentary_style": "short-left-right-pane"
  }
}`,
  moveReply: `{
  "action": "move",
  "uci": "h5h6",
  "promotion": null,
  "commentary": "I gain space on the kingside and keep the structure intact."
}`,
  drawClaim: `{
  "action": "claim_draw",
  "basis": "threefold",
  "intended_move_uci": null,
  "commentary": "The position has repeated. I claim the draw."
}`,
};

export const deploymentModes = [
  {
    mode: "Gemini vs Gemini",
    bestFor: "High-polish showcase and easiest operations",
    latency: "~0.8-3.0 s/move",
    risk: "Token cost and internet dependence",
  },
  {
    mode: "Gemini vs local",
    bestFor: "Best product balance",
    latency: "~0.5-2.5 s local, ~0.8-3.0 s cloud",
    risk: "Asymmetric timing and more orchestration logic",
  },
  {
    mode: "Local vs local",
    bestFor: "Offline-first and strongest privacy",
    latency: "~0.3-3.0 s on capable GPUs",
    risk: "Two concurrent local models raise memory demand sharply",
  },
];

export const localModelTiers = [
  {
    tier: "Small",
    tags: "qwen3.5:9b, gemma4:e4b-it-q4",
    recommendation: "Good entry point for one local side and workable dual-local runs on stronger GPUs.",
  },
  {
    tier: "Medium",
    tags: "qwen3.5:27b, gemma4:26b-a4b-it-q4",
    recommendation: "Best premium local side; typically wants roughly 24 GB VRAM-class hardware or heavy RAM fallback.",
  },
  {
    tier: "Large",
    tags: "gemma4:31b-it-q4",
    recommendation: "Best treated as a single premium side rather than two concurrent copies on a normal workstation.",
  },
];

export const costHighlights = [
  "Gemini 2.5 Pro side: roughly $0.22 per game",
  "Gemini 2.5 Flash side: roughly $0.054 per game",
  "Pro vs Flash: roughly $0.27 per game",
  "Pro vs Pro: roughly $0.44 per game",
  "Flash vs Flash: roughly $0.11 per game",
];

export const securityNotes = [
  "Use paid Gemini tiers when privacy boundaries matter.",
  "Keep local prompts on-device with Ollama or LM Studio when the deployment requires stronger privacy.",
  "Store runtime secrets with Docker Compose secrets and build-time secrets with Docker build secrets, not plain environment variables baked into images.",
  "Review GPLv3 obligations early if the app ships Stockfish binaries directly.",
];

export const roadmapPhases = [
  {
    phase: "Foundations",
    window: "2-3 weeks",
    items: "Rules engine, event log, PGN export, Stockfish bridge",
  },
  {
    phase: "Cloud mode",
    window: "1-2 weeks",
    items: "Gemini adapter, strict move schemas, cloud-vs-cloud baseline",
  },
  {
    phase: "Hybrid mode",
    window: "2-3 weeks",
    items: "Gemini vs Ollama end-to-end orchestration",
  },
  {
    phase: "Local runtime maturity",
    window: "1-2 weeks",
    items: "LM Studio compatibility and local model management",
  },
  {
    phase: "UI polish",
    window: "3-4 weeks",
    items: "3D animation sync, observer view, commentary theater",
  },
  {
    phase: "Hardening",
    window: "3-4 weeks",
    items: "Fuzzing, cost controls, monitoring, packaging, fallbacks",
  },
];

export const testingMatrix = [
  ["Unit", "Legality, castling rights, en passant windows, promotion, stalemate, dead positions, clock flips, result precedence"],
  ["Integration", "Gemini adapter, Ollama adapter, LM Studio fallback, Stockfish lifecycle, event ordering"],
  ["Fuzzing", "Invalid UCI, malformed JSON, missing promotion, impossible draw claims, truncated streaming"],
  ["Load", "Concurrent sessions, local queue depth, cold starts, long-context latency"],
  ["Golden games", "Known PGNs for repetitions, claims, stalemates, promotions, and illegal-move edges"],
  ["UI sync", "Animation ACK timing, duplicate events, reconnect recovery, dropped frames"],
];

export const fallbackPolicies = [
  ["Gemini timeout", "Retry once with a tighter prompt, then switch to Flash-Lite or a configured local side"],
  ["Local model overloaded", "Queue requests, shrink commentary context, or fall back to a smaller local tag"],
  ["Invalid model move", "Reject and resubmit with the same state snapshot plus an explicit illegality hint"],
  ["Stockfish unavailable", "Continue move generation without evaluation while marking analysis as degraded"],
  ["UI animation lag", "Keep clocks authoritative on the server and replay missed events on reconnect"],
  ["Wrong draw claim", "Apply the selected rules profile and continue the game deterministically"],
];

export const sourceGroups = [
  "FIDE Laws of Chess and current handbook references",
  "FIDE Arbiters' Manual 2025 and quickplay/draw-claim guidance",
  "Gemini API model cards, pricing, function calling, and structured outputs",
  "Ollama chat, structured outputs, tool calling, Docker, GPU, and pricing docs",
  "LM Studio REST, OpenAI compatibility, headless mode, offline docs, and system requirements",
  "Stockfish site, GitHub, and UCI command docs",
  "Docker Compose, secrets, startup-order, and multi-platform build docs",
  "python-chess legality, FEN, draw-claim, and engine-communication docs",
];
