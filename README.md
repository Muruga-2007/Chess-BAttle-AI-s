# Chess Local Cloud

`Chess Local Cloud` is a runnable MVP derived from `deep-research-report.md`. It implements the report's core shape inside a Next.js application:

- an authoritative chess state machine
- rule-aware session orchestration
- three deployment modes
- strict FIDE vs practical app behavior
- ordered event logging
- visible left/right commentary panes
- API routes for match creation and move advancement

The current build is intentionally `demo-first`. It runs end to end without Gemini, Ollama, LM Studio, or Stockfish being online. Provider adapters are represented in the app state and environment model so the orchestration surface is usable immediately and ready for live integrations next.

## Visual design

The current `/play` experience is designed as an AI match room instead of a generic dashboard.

- The board remains the central stage and the main visual authority.
- White and black commentary live on the left and right of the board so the interface reads like two opponents talking across the position.
- The palette uses dark obsidian surfaces, brass highlights, pine accents, and warm wood tones so the board, clocks, and rails feel physically related.
- Typography is intentionally dramatic at the top level and calmer in the operational surfaces, which helps the board stay dominant while the controls remain readable.
- The board framing, shadows, square treatment, and piece tokens are meant to feel more like a stylized physical set than a flat web widget.

## Animation

Motion is used to support the match flow rather than decorate it.

- The page enters with a staged reveal so the room feels assembled instead of dropped in.
- Last-move highlights animate on the board so move commits are easy to track.
- Visible thinking time is added before each move resolves so the AI feels like it is actually considering the position.
- Commentary bubbles appear as conversational arrivals instead of log entries.
- Autoplay is paced to feel like a live exchange rather than instant simulation.

## What is implemented

- `/play` playable orchestration UI
- `POST /api/session` to create a new session
- `GET /api/session/:id` to inspect the current session
- `POST /api/session/:id/advance` to advance one ply
- `GET /api/health` for a simple runtime health check
- in-memory session store for fast local development
- draw-aware rules handling for:
  threefold claims, fivefold automatic draws, 50-move claims, 75-move automatic draws, stalemate, checkmate, and insufficient material

## Requirements

- Node.js 20+
- npm 10+

Optional for later live integrations:

- Ollama running on `http://localhost:11434`
- LM Studio server running on `http://localhost:1234/v1`
- Gemini API key
- Stockfish binary path

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
copy .env.example .env.local
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env.local
```

3. Start the application:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

5. Launch the actual runtime from:

```text
http://localhost:3000/play
```

## Production build

```bash
npm run build
npm run start
```

## Docker

Build and run the app container:

```bash
docker compose up --build
```

If you also want an Ollama container available for future adapter work:

```bash
docker compose --profile local-llm up --build
```

The compose file expects `.env.local` to exist.

## Environment variables

`DEMO_MODE`

- `true` keeps the current deterministic adapter simulation enabled
- `false` is reserved for future live-provider execution

`GEMINI_API_KEY`

- placeholder for future Gemini integration

`GEMINI_BASE_URL`

- default Gemini API base URL

`GEMINI_FLASH_MODEL`

- cloud fast-side model identifier

`GEMINI_PRO_MODEL`

- cloud premium-side model identifier

`OLLAMA_BASE_URL`

- local Ollama endpoint

`OLLAMA_MODEL`

- primary local model tag

`LM_STUDIO_BASE_URL`

- local LM Studio OpenAI-compatible endpoint

`LM_STUDIO_MODEL`

- fallback local model identifier

`STOCKFISH_PATH`

- reserved for future engine-side evaluation integration

## How to use the app

1. Open `/play`.
2. Choose one of the three match modes: `Gemini vs local`, `Gemini vs Gemini`, or `Local vs local`.
3. Choose `Strict FIDE` or `Practical app`.
4. Set clocks and increment.
5. Start a match.
6. Use `Advance ply` to step the orchestrator manually, or enable `Autoplay`.
7. Inspect the board state, clocks, commentary, PGN, ordered event stream, and draw conditions.

## Important limitation

Sessions are stored in memory. Restarting the Next.js server clears active matches. That is acceptable for the current MVP but not for production. The next implementation step would be persistent storage plus live Gemini/Ollama/LM Studio/Stockfish adapters.

## Source document

The source design document remains in:

`deep-research-report.md`
