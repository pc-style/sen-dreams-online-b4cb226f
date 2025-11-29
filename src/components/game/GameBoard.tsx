/**
 * Main Game Board Component - Dreamy themed
 */

import { useState } from 'react';
import { PlayerGameView, PlayerAction } from '@/game/types';
import { PlayerPanel } from './PlayerPanel';
import { CentralArea } from './CentralArea';
import { ScoreBoard } from './ScoreBoard';
import { EffectModal } from './EffectModal';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, Moon, Sparkles, Star } from 'lucide-react';
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
    // During effect phase, all slots are selectable (for peek/swap)
    if (gameView.pendingEffect?.awaitingSelection) {
      return [0, 1, 2, 3];
    }
    // During action phase with drawn card, can replace own slots
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
  
  const drawnCardHasEffect = gameView.drawnCard?.visible?.effectType !== 'none' && 
                             gameView.drawnCard?.visible?.effectType !== undefined;
  
  // Handle initial peek card selection
  const handlePeekSlotClick = (index: number) => {
    if (peekedSlots.includes(index)) {
      // Deselect
      setPeekedSlots(peekedSlots.filter(i => i !== index));
    } else if (peekedSlots.length < 2) {
      // Select (max 2)
      setPeekedSlots([...peekedSlots, index]);
    }
  };
  
  const handleAcknowledgePeek = () => {
    setPeekedSlots([]); // Reset for next round
    onAction({ type: 'ACKNOWLEDGE_INITIAL_PEEK' });
  };
  
  // Initial peek phase
  if (gameView.phase === 'initial_peek') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-3 sm:p-4 relative overflow-hidden">
        <Stars />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/30 mb-3">
              <Eye className="w-7 h-7 text-purple-300" />
            </div>
            <h2 className="text-xl font-bold text-purple-100 mb-1">Choose 2 Cards to Peek</h2>
            <p className="text-sm text-purple-300/70">
              {peekedSlots.length < 2 
                ? `Tap ${2 - peekedSlots.length} more card${peekedSlots.length === 1 ? '' : 's'} to memorize`
                : 'Memorize these cards, then confirm!'}
            </p>
          </div>
          
          {myPlayer && (
            <div className="mb-6">
              <PlayerPanel
                player={myPlayer}
                isMe={true}
                myDreamSlots={gameView.myDreamSlots}
                showInitialPeek={!gameView.hasSeenInitialCards}
                selectableSlots={!gameView.hasSeenInitialCards ? [0, 1, 2, 3] : []}
                peekedSlots={peekedSlots}
                onSlotClick={!gameView.hasSeenInitialCards ? handlePeekSlotClick : undefined}
                compact
              />
            </div>
          )}
          
          {!gameView.hasSeenInitialCards ? (
            <div className="text-center">
              <Button
                onClick={handleAcknowledgePeek}
                disabled={peekedSlots.length !== 2}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50"
              >
                I've memorized them
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-purple-300/60 animate-pulse text-sm">
              Waiting for others...
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
  
  // Main game
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col relative overflow-hidden">
      <Stars />
      
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-3 sm:p-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-purple-200">
            <Moon className="w-4 h-4" />
            <span className="text-sm font-medium">Round {gameView.roundNumber}</span>
          </div>
          <div className="text-xs text-purple-300/60">
            {gameView.deckCount} cards left
          </div>
        </div>
        
        {/* Opponents */}
        <div className={cn(
          "grid gap-2 mb-3",
          otherPlayers.length === 1 && "grid-cols-1",
          otherPlayers.length >= 2 && "grid-cols-2"
        )}>
          {otherPlayers.map(player => (
            <PlayerPanel
              key={player.playerId}
              player={player}
              isMe={false}
              selectableSlots={gameView.pendingEffect?.awaitingSelection ? [0, 1, 2, 3] : []}
              onSlotClick={(index) => handleOtherSlotClick(player.playerId, index)}
              compact
            />
          ))}
        </div>
        
        {/* Central area */}
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
          hasEffect={drawnCardHasEffect}
        />
        
        {/* My panel */}
        {myPlayer && (
          <div className="mt-auto pt-3">
            <PlayerPanel
              player={myPlayer}
              isMe={true}
              myDreamSlots={gameView.myDreamSlots}
              selectableSlots={selectableSlots}
              onSlotClick={handleSlotClick}
              compact
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

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Star className="absolute top-16 left-[10%] w-2 h-2 text-yellow-200/30 animate-pulse" />
      <Star className="absolute top-24 right-[15%] w-1.5 h-1.5 text-yellow-200/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <Star className="absolute top-32 left-[30%] w-1.5 h-1.5 text-purple-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
      <Star className="absolute bottom-24 right-[20%] w-2 h-2 text-purple-300/20 animate-pulse" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
}
