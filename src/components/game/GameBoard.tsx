/**
 * Main Game Board - Fixed height layout that fits screen
 */

import { useState } from 'react';
import { PlayerGameView, PlayerAction } from '@/game/types';
import { PlayerPanel } from './PlayerPanel';
import { CentralArea } from './CentralArea';
import { ScoreBoard } from './ScoreBoard';
import { EffectModal } from './EffectModal';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameView: PlayerGameView;
  onAction: (action: PlayerAction) => void;
  onNewRound: () => void;
}

export function GameBoard({ gameView, onAction, onNewRound }: GameBoardProps) {
  const [peekedSlots, setPeekedSlots] = useState<number[]>([]);
  
  const myPlayer = gameView.players.find(p => p.playerId === gameView.myPlayerId);
  const otherPlayers = gameView.players.filter(p => p.playerId !== gameView.myPlayerId);
  
  const getSelectableSlots = (): number[] => {
    if (gameView.pendingEffect?.awaitingSelection) {
      return [0, 1, 2, 3];
    }
    if (gameView.isMyTurn && gameView.turnPhase === 'action' && gameView.drawnCard) {
      return [0, 1, 2, 3];
    }
    return [];
  };
  
  const selectableSlots = getSelectableSlots();
  
  const handleSlotClick = (slotIndex: number) => {
    if (gameView.turnPhase === 'action' && gameView.drawnCard) {
      onAction({ type: 'REPLACE_DREAM_SLOT', slotIndex });
    } else if (gameView.pendingEffect?.awaitingSelection) {
      onAction({ type: 'SELECT_SLOT', targetPlayerId: gameView.myPlayerId, slotIndex });
    }
  };
  
  const handleOtherSlotClick = (playerId: string, slotIndex: number) => {
    if (gameView.pendingEffect?.awaitingSelection) {
      onAction({ type: 'SELECT_SLOT', targetPlayerId: playerId, slotIndex });
    }
  };
  
  const handlePeekSlotClick = (index: number) => {
    if (peekedSlots.includes(index)) {
      setPeekedSlots(peekedSlots.filter(i => i !== index));
    } else if (peekedSlots.length < 2) {
      setPeekedSlots([...peekedSlots, index]);
    }
  };
  
  const handleAcknowledgePeek = () => {
    setPeekedSlots([]);
    onAction({ type: 'ACKNOWLEDGE_INITIAL_PEEK' });
  };
  
  // Initial peek phase
  if (gameView.phase === 'initial_peek') {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
          {/* Header */}
          <div className="text-center mb-6 shrink-0">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 mb-3">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              Choose 2 Cards to Peek
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {peekedSlots.length < 2 
                ? `Tap ${2 - peekedSlots.length} more card${peekedSlots.length === 1 ? '' : 's'} to memorize`
                : 'Memorize these values, then confirm!'}
            </p>
          </div>
          
          {/* Player cards */}
          {myPlayer && (
            <div className="mb-6 shrink-0">
              <PlayerPanel
                player={myPlayer}
                isMe={true}
                myDreamSlots={gameView.myDreamSlots}
                showInitialPeek={!gameView.hasSeenInitialCards}
                selectableSlots={!gameView.hasSeenInitialCards ? [0, 1, 2, 3] : []}
                peekedSlots={peekedSlots}
                onSlotClick={!gameView.hasSeenInitialCards ? handlePeekSlotClick : undefined}
                size="md"
              />
            </div>
          )}
          
          {/* Confirm button */}
          {!gameView.hasSeenInitialCards ? (
            <Button
              onClick={handleAcknowledgePeek}
              disabled={peekedSlots.length !== 2}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shrink-0"
            >
              I've memorized them
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="text-muted-foreground text-sm">
              Waiting for other players...
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Scoring phase
  if (gameView.phase === 'scoring' || gameView.phase === 'game_over') {
    return (
      <ScoreBoard
        players={gameView.players}
        myPlayerId={gameView.myPlayerId}
        roundNumber={gameView.roundNumber}
        isGameOver={gameView.phase === 'game_over'}
        onNewRound={onNewRound}
      />
    );
  }
  
  // Main game - fixed height layout
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-2 sm:p-3 min-h-0">
        {/* Header - compact */}
        <header className="flex items-center justify-between py-2 px-1 shrink-0">
          <span className="text-sm font-semibold text-foreground">Round {gameView.roundNumber}</span>
          <span className="text-sm text-muted-foreground">{gameView.deckCount} cards</span>
        </header>
        
        {/* Opponents - compact, shrink if needed */}
        <div className={cn(
          "shrink-0 grid gap-2 mb-2",
          otherPlayers.length === 1 && "grid-cols-1 max-w-md mx-auto w-full",
          otherPlayers.length >= 2 && "grid-cols-2"
        )}>
          {otherPlayers.map(player => (
            <PlayerPanel
              key={player.playerId}
              player={player}
              isMe={false}
              selectableSlots={gameView.pendingEffect?.awaitingSelection ? [0, 1, 2, 3] : []}
              onSlotClick={(index) => handleOtherSlotClick(player.playerId, index)}
              size="sm"
            />
          ))}
        </div>
        
        {/* Central play area - fills remaining space */}
        <div className="flex-1 min-h-0">
          <CentralArea
            deckCount={gameView.deckCount}
            topDiscard={gameView.topDiscard}
            drawnCard={gameView.drawnCard}
            takeTwoCards={gameView.takeTwoCards}
            isMyTurn={gameView.isMyTurn}
            turnPhase={gameView.turnPhase}
            onDrawFromDeck={() => onAction({ type: 'DRAW_FROM_DECK' })}
            onDrawFromDiscard={() => onAction({ type: 'DRAW_FROM_DISCARD' })}
            onDiscard={() => onAction({ type: 'DISCARD_DRAWN_CARD' })}
            onUseEffect={() => onAction({ type: 'USE_CARD_EFFECT' })}
            onDeclareWakeUp={() => onAction({ type: 'DECLARE_WAKE_UP' })}
            onChooseTakeTwo={(idx) => onAction({ type: 'CHOOSE_TAKE_TWO_CARD', cardIndex: idx })}
            canDiscard={gameView.canDiscard}
            canUseEffect={gameView.canUseEffect}
          />
        </div>
        
        {/* My panel - fixed at bottom */}
        {myPlayer && (
          <div className="shrink-0 pt-2">
            <PlayerPanel
              player={myPlayer}
              isMe={true}
              myDreamSlots={gameView.myDreamSlots}
              selectableSlots={selectableSlots}
              onSlotClick={handleSlotClick}
              size="md"
            />
          </div>
        )}
        
        {/* Effect modal */}
        {gameView.pendingEffect && (
          <EffectModal
            effect={gameView.pendingEffect}
            onCancel={() => onAction({ type: 'CANCEL_EFFECT' })}
          />
        )}
      </div>
    </div>
  );
}
