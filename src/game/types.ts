/**
 * Sen Card Game - Core Types
 */

// Card effect types per rules
export type EffectType = 
  | 'none'           // Normal card
  | 'take_two'       // Weź 2 - Draw 2, keep 1
  | 'peek_any'       // Podejrzyj 1 - Peek at any card
  | 'swap_blind';    // Zamień 2 - Swap any 2 blindly

export interface CardDefinition {
  id: string;
  name: string;
  crowValue: number;
  effectType: EffectType;
  description: string;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

export interface DreamSlot {
  card: CardInstance | null;
  isRevealed: boolean;
}

export interface PlayerState {
  playerId: string;
  playerName: string;
  seatIndex: number;
  dreamSlots: DreamSlot[];
  isConnected: boolean;
  roundScore: number;
  totalScore: number;
  hasSeenInitialCards: boolean;
}

export type GamePhase = 
  | 'lobby'
  | 'dealing'
  | 'initial_peek'
  | 'playing'
  | 'scoring'
  | 'game_over';

export type TurnPhase =
  | 'draw'
  | 'action'
  | 'effect'
  | 'take_two_choose'
  | 'end';

export interface GameState {
  roomId: string;
  phase: GamePhase;
  roundNumber: number;
  deck: CardInstance[];
  discard: CardInstance[];
  players: PlayerState[];
  activePlayerIndex: number;
  turnPhase: TurnPhase;
  drawnCard: CardInstance | null;
  drawnFromDeck: boolean; // Track if card was drawn from deck (for special effects)
  takeTwoCards: CardInstance[] | null;
  pendingEffect: PendingEffect | null;
  targetScore: number;
  version: number;
  wakeUpCallerId: string | null; // Track who called Pobudka
}

export interface PendingEffect {
  type: EffectType;
  sourcePlayerId: string;
  selectedSlots: { playerId: string; slotIndex: number }[];
  peekedCard: CardInstance | null;
  awaitingSelection: 'any_slot' | 'second_slot' | null;
}

export type PlayerAction =
  | { type: 'DRAW_FROM_DECK' }
  | { type: 'DRAW_FROM_DISCARD' }
  | { type: 'REPLACE_DREAM_SLOT'; slotIndex: number }
  | { type: 'DISCARD_DRAWN_CARD' }
  | { type: 'USE_CARD_EFFECT' }
  | { type: 'DECLARE_WAKE_UP' }
  | { type: 'SELECT_SLOT'; targetPlayerId: string; slotIndex: number }
  | { type: 'CANCEL_EFFECT' }
  | { type: 'ACKNOWLEDGE_INITIAL_PEEK' }
  | { type: 'CHOOSE_TAKE_TWO_CARD'; cardIndex: number };

export interface PublicCardView {
  instanceId: string;
  visible: CardDefinition | null;
}

export interface PublicDreamSlotView {
  hasCard: boolean;
  card: PublicCardView | null;
  isRevealed: boolean;
}

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

export interface PlayerGameView {
  roomId: string;
  phase: GamePhase;
  roundNumber: number;
  myPlayerId: string;
  myDreamSlots: PublicDreamSlotView[];
  myTotalScore: number;
  myRoundScore: number;
  hasSeenInitialCards: boolean;
  players: PublicPlayerView[];
  deckCount: number;
  topDiscard: PublicCardView | null;
  activePlayerIndex: number;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  drawnCard: PublicCardView | null;
  canDiscard: boolean; // Per rules: only if drawn from deck
  canUseEffect: boolean; // Per rules: only if drawn from deck AND has effect
  takeTwoCards: PublicCardView[] | null;
  pendingEffect: {
    type: EffectType;
    awaitingSelection: 'any_slot' | 'second_slot' | null;
    peekedCard: PublicCardView | null;
  } | null;
  version: number;
}

export interface RoomInfo {
  id: string;
  code: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  playerCount: number;
  maxPlayers: number;
  targetScore: number;
}
