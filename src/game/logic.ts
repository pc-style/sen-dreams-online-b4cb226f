/**
 * Sen Card Game - Pure Game Logic Functions
 * All game rules are implemented here as pure functions
 */

import { 
  GameState, 
  PlayerState, 
  PlayerAction, 
  PlayerGameView,
  PublicPlayerView,
  PublicDreamSlotView,
  PublicCardView,
  DreamSlot,
  PendingEffect,
  CardInstance
} from './types';
import { 
  createDeck, 
  shuffleArray, 
  getCardDefinition, 
  getCrowValue,
  hasEffect,
  getEffectType 
} from './cards';

// Initial game state
export function createInitialGameState(
  roomId: string, 
  players: { playerId: string; playerName: string }[],
  targetScore: number = 100
): GameState {
  const deck = shuffleArray(createDeck());
  
  // Deal 4 cards to each player
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
  
  // Put one card face up on discard pile
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
    wakeUpCalledBy: null,
    pendingEffect: null,
    targetScore,
    version: 1,
  };
}

// Check if an action is valid
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
      return isActivePlayer && 
             state.phase === 'playing' && 
             state.turnPhase === 'draw' &&
             state.wakeUpCalledBy === null;
             
    case 'SELECT_OWN_SLOT':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId &&
             state.pendingEffect.awaitingSelection === 'own_slot' &&
             action.slotIndex >= 0 && 
             action.slotIndex < 4;
             
    case 'SELECT_OTHER_SLOT':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId &&
             state.pendingEffect.awaitingSelection === 'other_slot' &&
             action.targetPlayerId !== playerId &&
             action.slotIndex >= 0 && 
             action.slotIndex < 4;
             
    case 'CONFIRM_SWAP':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId &&
             state.pendingEffect.awaitingSelection === 'confirm_swap';
             
    case 'CANCEL_EFFECT':
      return state.pendingEffect !== null &&
             state.pendingEffect.sourcePlayerId === playerId;
             
    default:
      return false;
  }
}

// Apply an action to the game state (returns new state)
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
      // Check if all players have acknowledged
      if (newState.players.every(p => p.hasSeenInitialCards)) {
        newState.phase = 'playing';
      }
      break;
      
    case 'DRAW_FROM_DECK':
      newState.drawnCard = newState.deck.pop()!;
      newState.turnPhase = 'action';
      break;
      
    case 'DRAW_FROM_DISCARD':
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
        
        newState.pendingEffect = {
          type: effectType,
          sourcePlayerId: playerId,
          selectedSlots: [],
          peekedCard: null,
          awaitingSelection: effectType === 'peek_own' ? 'own_slot' : 'other_slot',
        };
        newState.turnPhase = 'effect';
      }
      break;
      
    case 'DECLARE_WAKE_UP':
      newState.wakeUpCalledBy = playerId;
      newState.turnPhase = 'action';
      // After wake up is called, the player still draws and plays
      // The round ends after completing the round back to the caller
      break;
      
    case 'SELECT_OWN_SLOT':
      if (newState.pendingEffect) {
        const slot = player.dreamSlots[action.slotIndex];
        newState.pendingEffect.selectedSlots.push({ playerId, slotIndex: action.slotIndex });
        
        if (newState.pendingEffect.type === 'peek_own') {
          newState.pendingEffect.peekedCard = slot.card;
          newState.pendingEffect.awaitingSelection = null;
          // Auto-complete after brief peek
          setTimeout(() => {}, 0); // Viewer handles this
        } else if (newState.pendingEffect.type === 'swap_blind' || newState.pendingEffect.type === 'swap_peek') {
          newState.pendingEffect.awaitingSelection = 'other_slot';
        }
      }
      break;
      
    case 'SELECT_OTHER_SLOT':
      if (newState.pendingEffect) {
        const targetPlayer = newState.players.find(p => p.playerId === action.targetPlayerId);
        if (targetPlayer) {
          newState.pendingEffect.selectedSlots.push({ 
            playerId: action.targetPlayerId, 
            slotIndex: action.slotIndex 
          });
          
          if (newState.pendingEffect.type === 'peek_other') {
            const slot = targetPlayer.dreamSlots[action.slotIndex];
            newState.pendingEffect.peekedCard = slot.card;
            newState.pendingEffect.awaitingSelection = null;
          } else if (newState.pendingEffect.type === 'swap_blind') {
            // Perform blind swap
            if (newState.pendingEffect.selectedSlots.length === 2) {
              performSwap(newState, newState.pendingEffect.selectedSlots);
              newState.pendingEffect = null;
              endTurn(newState);
            } else {
              newState.pendingEffect.awaitingSelection = 'own_slot';
            }
          } else if (newState.pendingEffect.type === 'swap_peek') {
            const slot = targetPlayer.dreamSlots[action.slotIndex];
            newState.pendingEffect.peekedCard = slot.card;
            newState.pendingEffect.awaitingSelection = 'confirm_swap';
          }
        }
      }
      break;
      
    case 'CONFIRM_SWAP':
      if (newState.pendingEffect && newState.pendingEffect.selectedSlots.length >= 1) {
        // For swap_peek, we swap the peeked card with one of our own
        // Need to select own slot first
        if (newState.pendingEffect.selectedSlots.length === 1) {
          newState.pendingEffect.awaitingSelection = 'own_slot';
        } else {
          performSwap(newState, newState.pendingEffect.selectedSlots);
          newState.pendingEffect = null;
          endTurn(newState);
        }
      }
      break;
      
    case 'CANCEL_EFFECT':
      newState.pendingEffect = null;
      endTurn(newState);
      break;
  }
  
  return newState;
}

// Helper: perform a swap between two slots
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

// Helper: end the current turn
function endTurn(state: GameState) {
  state.turnPhase = 'draw';
  state.drawnCard = null;
  state.pendingEffect = null;
  
  // Move to next player
  const nextIndex = (state.activePlayerIndex + 1) % state.players.length;
  state.activePlayerIndex = nextIndex;
  
  // Check if round ends (wake up was called and we're back to the caller)
  if (state.wakeUpCalledBy !== null) {
    const callerIndex = state.players.findIndex(p => p.playerId === state.wakeUpCalledBy);
    if (nextIndex === callerIndex) {
      endRound(state);
    }
  }
  
  // Check if deck is empty - reshuffle discard
  if (state.deck.length === 0 && state.discard.length > 1) {
    const topDiscard = state.discard.pop()!;
    state.deck = shuffleArray(state.discard);
    state.discard = [topDiscard];
  }
}

// Helper: end the current round
function endRound(state: GameState) {
  state.phase = 'scoring';
  
  // Reveal all cards and calculate scores
  for (const player of state.players) {
    player.roundScore = 0;
    for (const slot of player.dreamSlots) {
      slot.isRevealed = true;
      if (slot.card) {
        player.roundScore += getCrowValue(slot.card);
      }
    }
    player.totalScore += player.roundScore;
  }
  
  // Check if game is over
  const maxScore = Math.max(...state.players.map(p => p.totalScore));
  if (maxScore >= state.targetScore) {
    state.phase = 'game_over';
  }
}

// Start a new round
export function startNewRound(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  newState.version++;
  
  // Create new deck and deal
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
  newState.wakeUpCalledBy = null;
  newState.pendingEffect = null;
  
  return newState;
}

// Derive the public view for a specific player
export function derivePlayerView(state: GameState, viewerId: string): PlayerGameView {
  const viewerPlayer = state.players.find(p => p.playerId === viewerId);
  const isActivePlayer = state.players[state.activePlayerIndex]?.playerId === viewerId;
  
  // Build my dream slots view (I can see my own cards)
  const myDreamSlots: PublicDreamSlotView[] = viewerPlayer?.dreamSlots.map((slot, index) => {
    const canSeeCard = 
      slot.isRevealed || 
      state.phase === 'scoring' || 
      state.phase === 'game_over' ||
      (state.phase === 'initial_peek' && (index === 0 || index === 3));
    
    return {
      hasCard: slot.card !== null,
      card: slot.card ? {
        instanceId: slot.card.instanceId,
        visible: canSeeCard ? getCardDefinition(slot.card.definitionId) ?? null : null,
      } : null,
      isRevealed: slot.isRevealed,
    };
  }) ?? [];
  
  // Build other players' views
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
  
  // Build pending effect view
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
  
  // Build top discard view
  const topDiscard = state.discard.length > 0 ? state.discard[state.discard.length - 1] : null;
  
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
    wakeUpCalledBy: state.wakeUpCalledBy,
    pendingEffect: pendingEffectView,
    version: state.version,
  };
}
