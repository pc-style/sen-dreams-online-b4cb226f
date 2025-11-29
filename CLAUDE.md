# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Prerequisites**: Node.js 18+ and bun package manager

```sh
# Install dependencies
bun install

# Terminal 1: Start development server
bun dev

# Terminal 2: Start Convex backend
bunx convex dev

# Open browser to http://localhost:8080
```

## Common Commands

- `bun dev` - Start Vite dev server on port 8080
- `bunx convex dev` - Start Convex backend and dashboard
- `bun run build` - Create production build
- `bun run lint` - Run ESLint
- `bun run build:dev` - Build in development mode

**Convex Deployment**: Configured in `.env.local` with `CONVEX_DEPLOYMENT=dev:festive-octopus-860`

## Project Overview

**Sen** is a multiplayer turn-based card game where 2-5 players try to minimize their score by strategically managing 4 dream cards. Each card has a crow value (1-13) and may have special effects (peek, swap, take two). The first player to reach the target score (default 100) loses.

## Architecture

### Frontend Structure (React + Vite)

```
src/
├── game/
│   ├── logic.ts       # Pure functional game state machine (rules engine)
│   ├── hooks.ts       # React hooks for Convex integration
│   ├── types.ts       # TypeScript definitions (GameState, PlayerGameView, etc)
│   └── cards.ts       # Card definitions, deck management
├── pages/
│   ├── Index.tsx      # Home (create/join room)
│   ├── Lobby.tsx      # Pre-game lobby
│   └── game/Game.tsx  # Main game interface
├── components/
│   ├── game/          # Game-specific components (GameLayout, PlayerZone, etc)
│   └── ui/            # shadcn/ui components (Button, Card, Dialog, etc)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── integrations/      # Third-party integrations
```

### Backend (Convex)

```
convex/
├── schema.ts    # Database schema (rooms, players, gameStates)
├── rooms.ts     # Room management queries/mutations
├── players.ts   # Player queries/mutations
└── gameStates.ts # Game state queries/mutations
```

### UI/Styling

- **Tailwind CSS** - Utility-first styling with dark theme support
- **shadcn/ui** - Headless component library built on Radix UI
- **Lucide React** - Icon library
- **next-themes** - Theme switching (light/dark)

## Game Logic

### State Machine Pattern

The game uses a pure functional approach in `src/game/logic.ts`:

- **GameState** - Server-side authoritative state with full game information
- **PlayerGameView** - Client-side view derived from GameState (hides opponent cards)
- **PlayerAction** - Discriminated union of all valid player actions
- **GamePhase** - Overall game progression (lobby → dealing → initial_peek → playing → scoring → game_over)
- **TurnPhase** - Within-turn progression (draw → action → effect → take_two_choose → end)

### Key Functions

- `createInitialGameState()` - Initialize new game after players join
- `applyAction()` - Apply player action, returns new GameState (immutable)
- `isActionValid()` - Validate action against current state
- `derivePlayerView()` - Generate player-specific view (hides hidden cards)
- `startNewRound()` - Handle scoring and setup next round

### Game Flow

1. **Create/Join** (Index.tsx) - Player creates room or joins via code
2. **Lobby** (Lobby.tsx) - Players wait for host to start
3. **Initial Peek** - Each player secretly views 2 of their 4 cards
4. **Playing** - Turn-based gameplay with draw/discard/special effect mechanics
5. **Scoring** - When a player calls "Pobudka" (wake up), round ends and scores are calculated
6. **Next Round** - Reset deck, keep cumulative scores, replay

### Special Effects

- **Take Two** (Weź 2) - Draw 2 cards, keep 1, discard the other
- **Peek Any** (Podejrzyj 1) - Look at any opponent's hidden card
- **Swap Blind** (Zamień 2) - Blindly swap any 2 cards across the table

Effects are tracked via `pendingEffect` field in GameState. Multi-step effects require additional player input through action dispatch.

## Data Flow (Multiplayer Sync)

1. Player action dispatched from UI → `useGameState().sendAction(action)`
2. Hook validates action, calls Convex mutation with new GameState
3. Convex persists updated state to database
4. Convex real-time query broadcasts to all connected clients
5. Clients receive new GameState, derive their PlayerGameView
6. React re-renders UI

## Convex Integration

**Hooks** (`src/game/hooks.ts`):
- `usePlayerId()` - Get/create persistent player ID (localStorage)
- `useCreateRoom()` - Create new room, returns {id, code}
- `useFindRoom()` - Find room by 4-letter code
- `useJoinRoom()` - Join room, assign seat
- `useRoomLobby()` - Subscribe to room and player list
- `useGameState()` - Subscribe to game state, send actions
- `useStartGame()` - Transition room from lobby to playing

**Queries** (convex/):
- `rooms.getRoom(roomId)` - Get room details
- `rooms.findRoomByCode(code)` - Find room by code
- `players.getPlayersByRoom(roomId)` - Get players in room
- `players.getUsedSeats(roomId)` - Get occupied seat indices
- `gameStates.getGameState(roomId)` - Get current game state

**Mutations** (convex/):
- `rooms.createRoom(code, hostId, targetScore)` - Create room
- `rooms.updateRoomStatus(roomId, status)` - Transition room state
- `players.addPlayer(roomId, playerId, playerName, seatIndex)` - Add player
- `gameStates.createGameState(roomId, state)` - Create game state
- `gameStates.updateGameState(roomId, state, version)` - Update game state

## Key Design Decisions

### Player Identity

Player IDs are generated client-side and stored in localStorage. This allows reconnection but requires browser data for ongoing games. IDs have format: `player_<timestamp>_<random>`

### No Direct Testing Framework

The project has no test suite configured. The pure functions in `src/game/logic.ts` are testable without any dependencies; adding tests should focus there.

### Immutable State

All game state mutations go through `applyAction()` which returns new state objects. Never mutate GameState directly.

### Room Codes

4-letter uppercase codes generated client-side (excludes easily-confused letters like I, O, U, L). Code query has index on `rooms.by_code` for fast lookup.

## Common Patterns

### Type Safety

- Use discriminated unions for action types: `{type: 'ACTION_NAME', ...args}`
- Leverage TypeScript to catch invalid state transitions at compile time
- Run `tsc` to check types without building

### Styling

- Use Tailwind utility classes primarily
- Component-specific styles in component files using `className`
- Dark theme via `next-themes` with class strategy
- Reusable UI components from `src/components/ui/`

### Error Handling

- Convex mutations return errors; log and show toast notifications
- Invalid actions fail silently (invalid action returns false)
- Network failures are handled by Convex hooks

## Debugging

- **Convex Dashboard** - `bunx convex dev` opens at http://localhost:19000
- **React DevTools** - Browser extension for component inspection
- **Console Logs** - Use `console.warn()` for invalid actions
- **Game State** - Use Redux DevTools pattern (store state in component props for inspection)

## Path Alias

The project uses path aliasing:
- `@/` maps to `src/`
- `@/components` → `src/components`
- `@/game/hooks` → `src/game/hooks`

Configure in `vite.config.ts` and `tsconfig.json`.

## Environment Variables

- `VITE_CONVEX_URL` - Convex deployment URL (in `.env.local`)
- `CONVEX_DEPLOYMENT` - Convex dev deployment identifier

## Notes for Future Work

- Game logic in `src/game/logic.ts` is fully testable; add vitest when tests become important
- UI redesign is in scope; maintain the game logic layer independently
- Player reconnection via localStorage could be enhanced with server-side session storage
- Game rules are documented inline in `logic.ts` with comments explaining phase transitions
