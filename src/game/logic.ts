/**
 * Sen Card Game - Pure Game Logic Functions
 * Implementing official rules
 */

import { 
  GameState, 
  PlayerState, 
  PlayerAction, 
  PlayerGameView,
  PublicPlayerView,
  PublicDreamSlotView,
  DreamSlot,
} from './types';
import { 
  createDeck, 
  shuffleArray, 
  getCardDefinition, 
  getCrowValue,
  hasEffect,
  getEffectType 
} from './cards';

export function createInitialGameState(
  roomId: string, 
  players: { playerId: string; playerName: string }[],
  targetScore: number = 100
): GameState {
  const deck = shuffleArray(createDeck());
  
  const playerStates: PlayerState[] = players.map((p, index) => {
    const dreamSlots: DreamSlot[] = [];
    for (let i = 0; i < 4; i++) {
      const card = deck.pop()!;
      dreamSlots.push({ card, isRevealed: false });
    }
    
    return {
      playerId: p.playerId,
      playerName: p.playerName,
      seatIndex: index,
      dreamSlots,
      isConnected: true,
      roundScore: 0,
      totalScore: 0,
      hasSeenInitialCards: false,
    };
  });
  
  const firstDiscard = deck.pop()!;
  
  return {
    roomId,
    phase: 'initial_peek',
    roundNumber: 1,
    deck,
    discard: [firstDiscard],
    players: playerStates,
    activePlayerIndex: 0,
    turnPhase: 'draw',
    drawnCard: null,
    takeTwoCards: null,
    pendingEffect: null,
    targetScore,
    version: 1,
    wakeUpCallerId: null,
  };
}

export function isActionValid(state: GameState, playerId: string, action: PlayerAction): boolean {
  const player = state.players.find(p => p.playerId === playerId);
  if (!player) return false;
  
  const isActivePlayer = state.players[state.activePlayerIndex]?.playerId === playerId;
  
  switch (action.type) {
    case 'ACKNOWLEDGE_INITIAL_PEEK':
      return state.phase === 'initial_peek' && !player.hasSeenInitialCards;
      
    case 'DRAW_FROM_DECK':
      return isActivePlayer && state.phase === 'playing' && state.turnPhase === 'draw' && state.deck.length > 0;
      
    case 'DRAW_FROM_DISCARD':
      return isActivePlayer && state.phase === 'playing' && state.turnPhase === 'draw' && state.discard.length > 0;
      
    case 'REPLACE_DREAM_SLOT':
      return isActivePlayer && 
             state.phase === 'playing' && 
             state.turnPhase === 'action' && 
             state.drawnCard !== null &&
             action.slotIndex >= 0 && 
             action.slotIndex < 4;
             
    case 'DISCARD_DRAWN_CARD':
      return isActivePlayer && 
             state.phase === 'playing' && 
             state.turnPhase === 'action' && 
             state.drawnCard !== null;
             
    case 'USE_CARD_EFFECT':
      return isActivePlayer && 
             state.phase === 'playing' && 
             state.turnPhase === 'action' && 
             state.drawnCard !== null &&
             hasEffect(state.drawnCard);
             
    case 'DECLARE_WAKE_UP':
      // Per rules: Pobudka is called at START of turn, INSTEAD of drawing
      return isActivePlayer && 
             state.phase === 'playing' && 
             state.turnPhase === 'draw';
             
    case 'SELECT_SLOT':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId &&
             state.pendingEffect.awaitingSelection !== null &&
             action.slotIndex >= 0 && 
             action.slotIndex < 4;
             
    case 'CANCEL_EFFECT':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId;
             
    case 'CHOOSE_TAKE_TWO_CARD':
      return isActivePlayer &&
             state.turnPhase === 'take_two_choose' &&
             state.takeTwoCards !== null &&
             (action.cardIndex === 0 || action.cardIndex === 1);
             
    default:
      return false;
  }
}

export function applyAction(state: GameState, playerId: string, action: PlayerAction): GameState {
  if (!isActionValid(state, playerId, action)) {
    console.warn('Invalid action:', action, 'by player:', playerId);
    return state;
  }
  
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  newState.version++;
  
  const playerIndex = newState.players.findIndex(p => p.playerId === playerId);
  const player = newState.players[playerIndex];
  
  switch (action.type) {
    case 'ACKNOWLEDGE_INITIAL_PEEK':
      player.hasSeenInitialCards = true;
      if (newState.players.every(p => p.hasSeenInitialCards)) {
        newState.phase = 'playing';
      }
      break;
      
    case 'DRAW_FROM_DECK':
      newState.drawnCard = newState.deck.pop()!;
      newState.turnPhase = 'action';
      break;
      
    case 'DRAW_FROM_DISCARD':
      // Per rules: Drawing from discard = MUST swap
      newState.drawnCard = newState.discard.pop()!;
      newState.turnPhase = 'action';
      break;
      
    case 'REPLACE_DREAM_SLOT':
      const oldCard = player.dreamSlots[action.slotIndex].card;
      player.dreamSlots[action.slotIndex].card = newState.drawnCard;
      if (oldCard) {
        newState.discard.push(oldCard);
      }
      newState.drawnCard = null;
      endTurn(newState);
      break;
      
    case 'DISCARD_DRAWN_CARD':
      if (newState.drawnCard) {
        newState.discard.push(newState.drawnCard);
        newState.drawnCard = null;
      }
      endTurn(newState);
      break;
      
    case 'USE_CARD_EFFECT':
      if (newState.drawnCard) {
        const effectType = getEffectType(newState.drawnCard);
        newState.discard.push(newState.drawnCard);
        newState.drawnCard = null;
        
        if (effectType === 'take_two') {
          // Draw 2 cards
          const card1 = newState.deck.pop();
          const card2 = newState.deck.pop();
          if (card1 && card2) {
            newState.takeTwoCards = [card1, card2];
            newState.turnPhase = 'take_two_choose';
          } else {
            endTurn(newState);
          }
        } else {
          newState.pendingEffect = {
            type: effectType,
            sourcePlayerId: playerId,
            selectedSlots: [],
            peekedCard: null,
            awaitingSelection: 'any_slot',
          };
          newState.turnPhase = 'effect';
        }
      }
      break;
      
    case 'DECLARE_WAKE_UP':
      // Per rules: Round ends IMMEDIATELY when Pobudka is called
      newState.wakeUpCallerId = playerId; // Track who called it
      endRound(newState);
      break;
      
    case 'SELECT_SLOT':
      if (newState.pendingEffect) {
        const targetPlayer = newState.players.find(p => p.playerId === action.targetPlayerId);
        if (targetPlayer) {
          newState.pendingEffect.selectedSlots.push({ 
            playerId: action.targetPlayerId, 
            slotIndex: action.slotIndex 
          });
          
          if (newState.pendingEffect.type === 'peek_any') {
            // Peek at the card
            const slot = targetPlayer.dreamSlots[action.slotIndex];
            newState.pendingEffect.peekedCard = slot.card;
            newState.pendingEffect.awaitingSelection = null;
          } else if (newState.pendingEffect.type === 'swap_blind') {
            if (newState.pendingEffect.selectedSlots.length === 1) {
              newState.pendingEffect.awaitingSelection = 'second_slot';
            } else if (newState.pendingEffect.selectedSlots.length === 2) {
              performSwap(newState, newState.pendingEffect.selectedSlots);
              newState.pendingEffect = null;
              endTurn(newState);
            }
          }
        }
      }
      break;
      
    case 'CANCEL_EFFECT':
      newState.pendingEffect = null;
      endTurn(newState);
      break;
      
    case 'CHOOSE_TAKE_TWO_CARD':
      if (newState.takeTwoCards) {
        const keptCard = newState.takeTwoCards[action.cardIndex];
        const discardedCard = newState.takeTwoCards[action.cardIndex === 0 ? 1 : 0];
        newState.discard.push(discardedCard);
        newState.drawnCard = keptCard;
        newState.takeTwoCards = null;
        newState.turnPhase = 'action';
      }
      break;
  }
  
  return newState;
}

function performSwap(state: GameState, slots: { playerId: string; slotIndex: number }[]) {
  if (slots.length !== 2) return;
  
  const player1 = state.players.find(p => p.playerId === slots[0].playerId);
  const player2 = state.players.find(p => p.playerId === slots[1].playerId);
  
  if (player1 && player2) {
    const temp = player1.dreamSlots[slots[0].slotIndex].card;
    player1.dreamSlots[slots[0].slotIndex].card = player2.dreamSlots[slots[1].slotIndex].card;
    player2.dreamSlots[slots[1].slotIndex].card = temp;
  }
}

function endTurn(state: GameState) {
  state.turnPhase = 'draw';
  state.drawnCard = null;
  state.pendingEffect = null;
  state.takeTwoCards = null;
  
  state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
  
  // Reshuffle if needed
  if (state.deck.length === 0 && state.discard.length > 1) {
    const topDiscard = state.discard.pop()!;
    state.deck = shuffleArray(state.discard);
    state.discard = [topDiscard];
  }
}

function endRound(state: GameState) {
  state.phase = 'scoring';
  
  // First pass: calculate raw scores and reveal cards
  let lowestScore = Infinity;
  for (const player of state.players) {
    player.roundScore = 0;
    for (const slot of player.dreamSlots) {
      slot.isRevealed = true;
      if (slot.card) {
        player.roundScore += getCrowValue(slot.card);
      }
    }
    lowestScore = Math.min(lowestScore, player.roundScore);
  }
  
  // Apply Pobudka penalty per rules:
  // If caller does NOT have lowest (or tied lowest) score, add +5 penalty
  const caller = state.players.find(p => p.playerId === state.wakeUpCallerId);
  if (caller && caller.roundScore > lowestScore) {
    caller.roundScore += 5; // Penalty for wrong call
  }
  
  // Add round scores to totals
  for (const player of state.players) {
    player.totalScore += player.roundScore;
  }
  
  // Check if game is over
  const maxScore = Math.max(...state.players.map(p => p.totalScore));
  if (maxScore >= state.targetScore) {
    state.phase = 'game_over';
  }
}

export function startNewRound(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  newState.version++;
  
  const deck = shuffleArray(createDeck());
  
  for (const player of newState.players) {
    player.dreamSlots = [];
    for (let i = 0; i < 4; i++) {
      const card = deck.pop()!;
      player.dreamSlots.push({ card, isRevealed: false });
    }
    player.roundScore = 0;
    player.hasSeenInitialCards = false;
  }
  
  const firstDiscard = deck.pop()!;
  
  newState.deck = deck;
  newState.discard = [firstDiscard];
  newState.phase = 'initial_peek';
  newState.roundNumber++;
  newState.activePlayerIndex = 0;
  newState.turnPhase = 'draw';
  newState.drawnCard = null;
  newState.takeTwoCards = null;
  newState.pendingEffect = null;
  newState.wakeUpCallerId = null;
  
  return newState;
}

export function derivePlayerView(state: GameState, viewerId: string): PlayerGameView {
  const viewerPlayer = state.players.find(p => p.playerId === viewerId);
  const isActivePlayer = state.players[state.activePlayerIndex]?.playerId === viewerId;
  
  const myDreamSlots: PublicDreamSlotView[] = viewerPlayer?.dreamSlots.map((slot, index) => {
    const canSeeCard = 
      slot.isRevealed || 
      state.phase === 'scoring' || 
      state.phase === 'game_over' ||
      (state.phase === 'initial_peek' && !viewerPlayer.hasSeenInitialCards); // Only show during peek if not yet acknowledged
    
    return {
      hasCard: slot.card !== null,
      card: slot.card ? {
        instanceId: slot.card.instanceId,
        visible: canSeeCard ? getCardDefinition(slot.card.definitionId) ?? null : null,
      } : null,
      isRevealed: slot.isRevealed,
    };
  }) ?? [];
  
  const players: PublicPlayerView[] = state.players.map(player => {
    const isMe = player.playerId === viewerId;
    const dreamSlots: PublicDreamSlotView[] = player.dreamSlots.map(slot => {
      const canSeeCard = 
        slot.isRevealed || 
        state.phase === 'scoring' || 
        state.phase === 'game_over';
      
      return {
        hasCard: slot.card !== null,
        card: slot.card ? {
          instanceId: slot.card.instanceId,
          visible: canSeeCard ? getCardDefinition(slot.card.definitionId) ?? null : null,
        } : null,
        isRevealed: slot.isRevealed,
      };
    });
    
    return {
      playerId: player.playerId,
      playerName: player.playerName,
      seatIndex: player.seatIndex,
      dreamSlots: isMe ? myDreamSlots : dreamSlots,
      isConnected: player.isConnected,
      totalScore: player.totalScore,
      roundScore: player.roundScore,
      isActivePlayer: state.players[state.activePlayerIndex]?.playerId === player.playerId,
    };
  });
  
  let pendingEffectView = null;
  if (state.pendingEffect && state.pendingEffect.sourcePlayerId === viewerId) {
    pendingEffectView = {
      type: state.pendingEffect.type,
      awaitingSelection: state.pendingEffect.awaitingSelection,
      peekedCard: state.pendingEffect.peekedCard ? {
        instanceId: state.pendingEffect.peekedCard.instanceId,
        visible: getCardDefinition(state.pendingEffect.peekedCard.definitionId) ?? null,
      } : null,
    };
  }
  
  const topDiscard = state.discard.length > 0 ? state.discard[state.discard.length - 1] : null;
  
  // Take two cards view
  let takeTwoCardsView = null;
  if (isActivePlayer && state.takeTwoCards) {
    takeTwoCardsView = state.takeTwoCards.map(card => ({
      instanceId: card.instanceId,
      visible: getCardDefinition(card.definitionId) ?? null,
    }));
  }
  
  return {
    roomId: state.roomId,
    phase: state.phase,
    roundNumber: state.roundNumber,
    myPlayerId: viewerId,
    myDreamSlots,
    myTotalScore: viewerPlayer?.totalScore ?? 0,
    myRoundScore: viewerPlayer?.roundScore ?? 0,
    hasSeenInitialCards: viewerPlayer?.hasSeenInitialCards ?? false,
    players,
    deckCount: state.deck.length,
    topDiscard: topDiscard ? {
      instanceId: topDiscard.instanceId,
      visible: getCardDefinition(topDiscard.definitionId) ?? null,
    } : null,
    activePlayerIndex: state.activePlayerIndex,
    isMyTurn: isActivePlayer,
    turnPhase: state.turnPhase,
    drawnCard: isActivePlayer && state.drawnCard ? {
      instanceId: state.drawnCard.instanceId,
      visible: getCardDefinition(state.drawnCard.definitionId) ?? null,
    } : null,
    takeTwoCards: takeTwoCardsView,
    pendingEffect: pendingEffectView,
    version: state.version,
  };
}
