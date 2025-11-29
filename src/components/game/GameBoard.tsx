/**
 * Main Game Board Component
 * Orchestrates the full game view
 */

import { useState, useEffect } from 'react';
import { PlayerGameView, PlayerAction } from '@/game/types';
import { PlayerPanel } from './PlayerPanel';
import { CentralArea } from './CentralArea';
import { ScoreBoard } from './ScoreBoard';
import { EffectModal } from './EffectModal';
import { Button } from '@/components/ui/button';
import { Bird, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameView: PlayerGameView;
  onAction: (action: PlayerAction) => void;
  onNewRound: () => void;
}

export function GameBoard({ gameView, onAction, onNewRound }: GameBoardProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  // Find myself and other players
  const myPlayer = gameView.players.find(p => p.playerId === gameView.myPlayerId);
  const otherPlayers = gameView.players.filter(p => p.playerId !== gameView.myPlayerId);
  
  // Calculate selectable slots based on game state
  const getSelectableSlots = (): number[] => {
    if (!gameView.isMyTurn) return [];
    
    // During action phase, can select own slots to replace
    if (gameView.turnPhase === 'action' && gameView.drawnCard) {
      return [0, 1, 2, 3];
    }
    
    // During effect phase
    if (gameView.pendingEffect?.awaitingSelection === 'own_slot') {
      return [0, 1, 2, 3];
    }
    
    return [];
  };
  
  const selectableSlots = getSelectableSlots();
  
  // Handle slot click
  const handleSlotClick = (slotIndex: number) => {
    if (gameView.turnPhase === 'action' && gameView.drawnCard) {
      onAction({ type: 'REPLACE_DREAM_SLOT', slotIndex });
    } else if (gameView.pendingEffect?.awaitingSelection === 'own_slot') {
      onAction({ type: 'SELECT_OWN_SLOT', slotIndex });
    }
  };
  
  // Handle other player slot click (for effects)
  const handleOtherSlotClick = (playerId: string, slotIndex: number) => {
    if (gameView.pendingEffect?.awaitingSelection === 'other_slot') {
      onAction({ type: 'SELECT_OTHER_SLOT', targetPlayerId: playerId, slotIndex });
    }
  };
  
  // Check if drawn card has an effect
  const drawnCardHasEffect = gameView.drawnCard?.visible?.effectType !== 'none' && 
                             gameView.drawnCard?.visible?.effectType !== undefined;
  
  // Initial peek phase UI
  if (gameView.phase === 'initial_peek') {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Eye className="w-6 h-6 text-accent" />
              Peek at Your Cards
            </h2>
            <p className="text-muted-foreground">
              Look at your first and last dream cards, then memorize them!
            </p>
          </div>
          
          {myPlayer && (
            <div className="mb-8">
              <PlayerPanel
                player={myPlayer}
                isMe={true}
                myDreamSlots={gameView.myDreamSlots}
                showInitialPeek={!gameView.hasSeenInitialCards}
              />
            </div>
          )}
          
          {!gameView.hasSeenInitialCards && (
            <div className="text-center">
              <Button
                onClick={() => onAction({ type: 'ACKNOWLEDGE_INITIAL_PEEK' })}
                size="lg"
              >
                I've memorized my cards
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          {gameView.hasSeenInitialCards && (
            <div className="text-center text-muted-foreground animate-pulse">
              Waiting for other players...
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Scoring phase UI
  if (gameView.phase === 'scoring' || gameView.phase === 'game_over') {
    return (
      <ScoreBoard
        players={gameView.players}
        myPlayerId={gameView.myPlayerId}
        roundNumber={gameView.roundNumber}
        isGameOver={gameView.phase === 'game_over'}
        wakeUpCalledBy={gameView.wakeUpCalledBy}
        onNewRound={onNewRound}
      />
    );
  }
  
  // Main playing phase
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bird className="w-5 h-5 text-primary" />
            <span className="font-medium">Round {gameView.roundNumber}</span>
          </div>
          {gameView.wakeUpCalledBy && (
            <div className="px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-sm font-medium animate-pulse">
              Pobudka! Final turns in progress...
            </div>
          )}
        </div>
        
        {/* Other players (top) */}
        <div className={cn(
          "grid gap-4 mb-6",
          otherPlayers.length === 1 && "grid-cols-1",
          otherPlayers.length === 2 && "grid-cols-2",
          otherPlayers.length >= 3 && "grid-cols-2 lg:grid-cols-3"
        )}>
          {otherPlayers.map(player => (
            <PlayerPanel
              key={player.playerId}
              player={player}
              isMe={false}
              selectableSlots={
                gameView.pendingEffect?.awaitingSelection === 'other_slot' 
                  ? [0, 1, 2, 3] 
                  : []
              }
              onSlotClick={(index) => handleOtherSlotClick(player.playerId, index)}
            />
          ))}
        </div>
        
        {/* Central area */}
        <CentralArea
          deckCount={gameView.deckCount}
          topDiscard={gameView.topDiscard}
          drawnCard={gameView.drawnCard}
          isMyTurn={gameView.isMyTurn}
          turnPhase={gameView.turnPhase}
          canDeclareWakeUp={gameView.wakeUpCalledBy === null}
          onDrawFromDeck={() => onAction({ type: 'DRAW_FROM_DECK' })}
          onDrawFromDiscard={() => onAction({ type: 'DRAW_FROM_DISCARD' })}
          onDiscard={() => onAction({ type: 'DISCARD_DRAWN_CARD' })}
          onUseEffect={() => onAction({ type: 'USE_CARD_EFFECT' })}
          onDeclareWakeUp={() => onAction({ type: 'DECLARE_WAKE_UP' })}
          hasEffect={drawnCardHasEffect}
        />
        
        {/* My panel (bottom) */}
        {myPlayer && (
          <div className="mt-6">
            <PlayerPanel
              player={myPlayer}
              isMe={true}
              myDreamSlots={gameView.myDreamSlots}
              selectableSlots={selectableSlots}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotClick}
            />
          </div>
        )}
        
        {/* Effect modal */}
        {gameView.pendingEffect && (
          <EffectModal
            effect={gameView.pendingEffect}
            onConfirm={() => onAction({ type: 'CONFIRM_SWAP' })}
            onCancel={() => onAction({ type: 'CANCEL_EFFECT' })}
          />
        )}
      </div>
    </div>
  );
}
