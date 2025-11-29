/**
 * Main Game Board Component - Accessible, responsive design
 */

import { useState } from 'react';
import { PlayerGameView, PlayerAction } from '@/game/types';
import { PlayerPanel } from './PlayerPanel';
import { CentralArea } from './CentralArea';
import { ScoreBoard } from './ScoreBoard';
import { EffectModal } from './EffectModal';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, Moon, Star } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-6 relative overflow-hidden">
        <Stars />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-purple-500/30 flex items-center justify-center border-2 border-purple-400/40 mb-4 shadow-xl shadow-purple-500/30">
              <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-100 mb-2">Choose 2 Cards to Peek</h1>
            <p className="text-base sm:text-lg text-purple-300/80">
              {peekedSlots.length < 2 
                ? `Tap ${2 - peekedSlots.length} more card${peekedSlots.length === 1 ? '' : 's'} to memorize`
                : 'Memorize these values, then confirm!'}
            </p>
          </div>
          
          {myPlayer && (
            <div className="mb-8 sm:mb-10">
              <PlayerPanel
                player={myPlayer}
                isMe={true}
                myDreamSlots={gameView.myDreamSlots}
                showInitialPeek={!gameView.hasSeenInitialCards}
                selectableSlots={!gameView.hasSeenInitialCards ? [0, 1, 2, 3] : []}
                peekedSlots={peekedSlots}
                onSlotClick={!gameView.hasSeenInitialCards ? handlePeekSlotClick : undefined}
                size="lg"
              />
            </div>
          )}
          
          {!gameView.hasSeenInitialCards ? (
            <div className="text-center">
              <Button
                onClick={handleAcknowledgePeek}
                disabled={peekedSlots.length !== 2}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 font-bold text-base sm:text-lg px-8 py-4"
              >
                I've memorized them
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-purple-300/70 animate-pulse text-base sm:text-lg">
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
  
  // Main game
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col relative overflow-hidden">
      <Stars />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-3 sm:p-4 md:p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 text-purple-200">
            <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-bold">Round {gameView.roundNumber}</span>
          </div>
          <div className="text-sm sm:text-base text-purple-300/70 font-medium">
            {gameView.deckCount} cards left
          </div>
        </div>
        
        {/* Opponents */}
        <div className={cn(
          "grid gap-3 sm:gap-4 mb-4 sm:mb-6",
          otherPlayers.length === 1 && "grid-cols-1 max-w-xl mx-auto w-full",
          otherPlayers.length >= 2 && "grid-cols-1 sm:grid-cols-2"
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
          canDiscard={gameView.canDiscard}
          canUseEffect={gameView.canUseEffect}
        />
        
        {/* My panel */}
        {myPlayer && (
          <div className="mt-auto pt-4 sm:pt-6">
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

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Star className="absolute top-20 left-[8%] w-3 h-3 text-yellow-200/30 animate-pulse" />
      <Star className="absolute top-28 right-[12%] w-2 h-2 text-yellow-200/25 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <Star className="absolute top-40 left-[25%] w-2 h-2 text-purple-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
      <Star className="absolute bottom-32 right-[18%] w-3 h-3 text-purple-300/25 animate-pulse" style={{ animationDelay: '0.7s' }} />
      <Star className="absolute top-1/3 left-[5%] w-2 h-2 text-yellow-200/20 animate-pulse" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
}
