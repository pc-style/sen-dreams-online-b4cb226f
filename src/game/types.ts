/**
 * Sen Card Game - Core Types
 * Server-authoritative game state with hidden information
 */

// Card effect types
export type EffectType = 
  | 'none'           // Normal card, no effect
  | 'peek_own'       // Peek at one of your own dream cards
  | 'peek_other'     // Peek at another player's dream card
  | 'swap_blind'     // Swap two cards without looking
  | 'swap_peek'      // Peek then optionally swap
  | 'dark_gift';     // Give a high-value card to another player

// Card definition (static data)
export interface CardDefinition {
  id: string;
  name: string;
  crowValue: number;       // 0-9 crow value (lower is better)
  effectType: EffectType;
  description: string;
}

// Card instance (runtime, unique per card in play)
export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

// Dream slot state
export interface DreamSlot {
  card: CardInstance | null;
  isRevealed: boolean;      // True during scoring or after specific reveals
}

// Player state in a game
export interface PlayerState {
  playerId: string;
  playerName: string;
  seatIndex: number;
  dreamSlots: DreamSlot[];  // 4 slots
  isConnected: boolean;
  roundScore: number;
  totalScore: number;
  hasSeenInitialCards: boolean;  // Players see first and last card at start
}

// Game phases
export type GamePhase = 
  | 'lobby'
  | 'dealing'
  | 'initial_peek'    // Players peek at their first and last cards
  | 'playing'
  | 'wake_up'         // Someone declared Pobudka
  | 'scoring'
  | 'game_over';

// Turn phases during playing
export type TurnPhase =
  | 'draw'            // Must draw from deck or discard
  | 'action'          // Choose to replace, discard, or use effect
  | 'effect'          // Resolving a card effect
  | 'end';            // Turn ending

// Full game state (server-authoritative, complete truth)
export interface GameState {
  roomId: string;
  phase: GamePhase;
  roundNumber: number;
  
  // Deck and discard
  deck: CardInstance[];           // Face down, only server knows
  discard: CardInstance[];        // Top card visible to all
  
  // Players
  players: PlayerState[];
  activePlayerIndex: number;
  
  // Current turn state
  turnPhase: TurnPhase;
  drawnCard: CardInstance | null; // Card currently held by active player
  
  // Wake up tracking
  wakeUpCalledBy: string | null;  // Player ID who called Pobudka
  
  // Effect state (for multi-step effects)
  pendingEffect: PendingEffect | null;
  
  // Target score for game end
  targetScore: number;
  
  // State version for optimistic updates
  version: number;
}

// Pending effect state
export interface PendingEffect {
  type: EffectType;
  sourcePlayerId: string;
  selectedSlots: { playerId: string; slotIndex: number }[];
  peekedCard: CardInstance | null;  // For peek effects
  awaitingSelection: 'own_slot' | 'other_slot' | 'confirm_swap' | null;
}

// Actions that players can take
export type PlayerAction =
  | { type: 'DRAW_FROM_DECK' }
  | { type: 'DRAW_FROM_DISCARD' }
  | { type: 'REPLACE_DREAM_SLOT'; slotIndex: number }
  | { type: 'DISCARD_DRAWN_CARD' }
  | { type: 'USE_CARD_EFFECT' }
  | { type: 'DECLARE_WAKE_UP' }
  | { type: 'SELECT_OWN_SLOT'; slotIndex: number }
  | { type: 'SELECT_OTHER_SLOT'; targetPlayerId: string; slotIndex: number }
  | { type: 'CONFIRM_SWAP' }
  | { type: 'CANCEL_EFFECT' }
  | { type: 'ACKNOWLEDGE_INITIAL_PEEK' };

// Public view of a card (what a player is allowed to see)
export interface PublicCardView {
  instanceId: string;
  // If null, card is face-down/hidden
  visible: CardDefinition | null;
}

// Public view of a dream slot
export interface PublicDreamSlotView {
  hasCard: boolean;
  card: PublicCardView | null;
  isRevealed: boolean;
}

// Public view of a player (what others see)
export interface PublicPlayerView {
  playerId: string;
  playerName: string;
  seatIndex: number;
  dreamSlots: PublicDreamSlotView[];
  isConnected: boolean;
  totalScore: number;
  roundScore: number;
  isActivePlayer: boolean;
}

// The filtered view sent to each player
export interface PlayerGameView {
  roomId: string;
  phase: GamePhase;
  roundNumber: number;
  
  // My own state (I can see my cards)
  myPlayerId: string;
  myDreamSlots: PublicDreamSlotView[];
  myTotalScore: number;
  myRoundScore: number;
  hasSeenInitialCards: boolean;
  
  // Other players (filtered view)
  players: PublicPlayerView[];
  
  // Visible game elements
  deckCount: number;
  topDiscard: PublicCardView | null;
  
  // Turn info
  activePlayerIndex: number;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  
  // If it's my turn and I drew a card
  drawnCard: PublicCardView | null;
  
  // Wake up info
  wakeUpCalledBy: string | null;
  
  // Pending effect (if I'm involved)
  pendingEffect: {
    type: EffectType;
    awaitingSelection: 'own_slot' | 'other_slot' | 'confirm_swap' | null;
    peekedCard: PublicCardView | null;  // Only if I'm the one peeking
  } | null;
  
  // State version
  version: number;
}

// Room info for lobby display
export interface RoomInfo {
  id: string;
  code: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  playerCount: number;
  maxPlayers: number;
  targetScore: number;
}
