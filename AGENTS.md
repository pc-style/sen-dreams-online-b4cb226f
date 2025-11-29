# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a multiplayer card game called "Sen" (Dream) built with React, TypeScript, Vite, and Convex. Players compete to minimize their score by managing a hand of 4 dream cards with special effects.

## Commands

### Development
- `bun dev` - Start development server on port 8080
- `bunx convex dev` - Start Convex backend (run in separate terminal)
- `bun run build` - Production build
- `bun run build:dev` - Development build
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

### Testing
No test framework is currently configured in this project.

## Architecture

### Game State Management

The game uses a **pure functional approach** for game logic with React hooks for state synchronization:

- **`src/game/logic.ts`** - Pure functions for game state transitions. All game rules are implemented here:
  - `createInitialGameState()` - Initialize a new game
  - `applyAction()` - Apply player actions to game state (immutable)
  - `isActionValid()` - Validate actions before applying
  - `derivePlayerView()` - Generate player-specific view (hides opponent's cards)
  - `startNewRound()` - Handle round transitions and scoring

- **`src/game/hooks.ts`** - React hooks that sync game state with Convex:
  - `usePlayerId()` - Manage player identity (localStorage)
  - `useCreateRoom()` - Create new game rooms
  - `useJoinRoom()` - Join existing rooms by code
  - `useGameState()` - Real-time game state subscription and action dispatch
  - Uses Convex real-time queries and mutations for multiplayer sync

- **`src/game/types.ts`** - TypeScript definitions for all game entities:
  - `GameState` - Server-side complete game state
  - `PlayerGameView` - Client-side view (filtered for individual player)
  - `PlayerAction` - All possible player actions (discriminated union)
  - `GamePhase` and `TurnPhase` - State machine phases

- **`src/game/cards.ts`** - Card definitions and deck management:
  - Card catalog with crow values and effect types
  - `createDeck()` - Generate shuffled deck of card instances
  - Helper functions to query card properties

### Game Flow

1. **Lobby** (`src/pages/Lobby.tsx`) - Players join via room code, host starts game
2. **Initial Peek** - Each player secretly views 2 of their 4 dream cards
3. **Playing** - Turn-based gameplay with draw/discard/effect mechanics
4. **Scoring** - Round ends when someone calls "Pobudka" (wake up), scores calculated
5. **Game Over** - First player to reach target score loses

### Component Structure

- **Pages** (`src/pages/`)
  - `Index.tsx` - Home page with room creation/joining
  - `Lobby.tsx` - Pre-game lobby
  - `game/Game.tsx` - Main game view

- **Game Components** (`src/components/game/`)
  - `GameLayout.tsx` - Overall game layout container
  - `PlayerZone.tsx` - Displays a player's dream cards
  - `DreamCard.tsx` - Individual card with interaction logic
  - `TableCenter.tsx` - Deck and discard pile
  - `Card.tsx` - Base card rendering component

### Data Layer

- **Convex Backend** (`convex/`)
  - Real-time queries and mutations for game state sync
  - Database schema: `rooms`, `gameStates`, `players`
  - Environment var: `VITE_CONVEX_URL`

- **Schema Definition** (`convex/schema.ts`)
  - Type-safe database schema with indexes
  - Automatic TypeScript type generation

### UI Framework

- shadcn/ui components (`src/components/ui/`)
- Tailwind CSS for styling
- Radix UI primitives
- Path alias `@/` maps to `src/`

## Key Implementation Details

### State Synchronization Pattern

The game uses a **single source of truth** pattern with Convex:
1. Client dispatches action via `useGameState().sendAction()`
2. Hook validates action locally, calls Convex mutation to update state
3. Convex broadcasts update to all clients via real-time queries
4. All clients receive updated `GameState` and derive their `PlayerGameView`
5. React re-renders UI based on new view

### Card Effect System

Card effects are resolved through a multi-phase turn system:
- Draw phase → Action phase → Effect phase → End phase
- Effects like "Take Two" or "Peek" create pending states that require additional player input
- `pendingEffect` field in GameState tracks in-progress effects

### Player Identity

Player IDs are generated client-side and stored in localStorage. This allows reconnection to games but means clearing browser data loses access to ongoing games.

## Development Notes

- This project was scaffolded via Lovable.dev
- Use Vite's hot module replacement for fast iteration
- Game logic in `src/game/logic.ts` is fully testable without React dependencies
- All game state mutations must go through `applyAction()` to maintain consistency