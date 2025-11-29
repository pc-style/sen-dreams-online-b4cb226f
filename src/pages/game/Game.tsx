
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameState, usePlayerId } from '@/game/hooks';
import { GameLayout } from '@/components/game/GameLayout';
import { PlayerZone } from '@/components/game/PlayerZone';
import { TableCenter } from '@/components/game/TableCenter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/game/Card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PublicDreamSlotView } from '@/game/types';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { playerId } = usePlayerId();
  const { gameView, isLoading, error, sendAction, newRound } = useGameState(roomId || null, playerId);
  const { toast } = useToast();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Redirect if not found
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      navigate('/');
    }
  }, [error, navigate, toast]);

  if (isLoading || !gameView) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0b1e] text-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  // --- Helpers for Opponent Arrangement ---
  // We want to arrange opponents around the top/sides.
  // gameView.players includes me.
  const myPlayerIndex = gameView.players.findIndex(p => p.playerId === playerId);
  const opponents = gameView.players.filter(p => p.playerId !== playerId);

  // Reorder opponents based on seat index relative to me to have a consistent clockwise order
  // (Not strictly necessary for simple layout but nice to have)
  // Let's just list them at the top for now. Responsive grid will handle 1-4 opponents.

  // --- Handlers ---

  const handleSlotClick = async (slotIndex: number, isMySlot: boolean, targetPlayerId: string) => {
    // Phase: Initial Peek
    if (gameView.phase === 'initial_peek') {
      if (!isMySlot) return;
      if (gameView.hasSeenInitialCards) return;

      // If already peeked 2, waiting for ack
      if (gameView.initialPeekedSlots.length >= 2) return;

      if (!gameView.initialPeekedSlots.includes(slotIndex)) {
         await sendAction({ type: 'REVEAL_INITIAL_CARD', slotIndex });
      }
      return;
    }

    // Phase: Playing
    if (gameView.phase === 'playing' && gameView.isMyTurn) {
        // TurnPhase: Action (Swap or Discard)
        if (gameView.turnPhase === 'action') {
            if (isMySlot && gameView.drawnCard) {
                // Swap drawn card with slot
                await sendAction({ type: 'REPLACE_DREAM_SLOT', slotIndex });
            }
        }

        // TurnPhase: Effect (Target Selection)
        if (gameView.turnPhase === 'effect' && gameView.pendingEffect) {
            // Need to select a slot
            if (gameView.pendingEffect.awaitingSelection) {
               await sendAction({ type: 'SELECT_SLOT', targetPlayerId, slotIndex });
            }
        }
    }
  };

  const handleDrawDeck = async () => {
    if (gameView.isMyTurn && gameView.turnPhase === 'draw') {
      await sendAction({ type: 'DRAW_FROM_DECK' });
    }
  };

  const handleDrawDiscard = async () => {
    if (gameView.isMyTurn && gameView.turnPhase === 'draw') {
      await sendAction({ type: 'DRAW_FROM_DISCARD' });
    }
  };

  const handleDiscardDrawn = async () => {
     if (gameView.canDiscard) {
       await sendAction({ type: 'DISCARD_DRAWN_CARD' });
     }
  };

  const handleUseEffect = async () => {
    if (gameView.canUseEffect) {
      await sendAction({ type: 'USE_CARD_EFFECT' });
    }
  };

  const handleWakeUp = async () => {
     await sendAction({ type: 'DECLARE_WAKE_UP' });
  };

  const handleInitialPeekAck = async () => {
    await sendAction({ type: 'ACKNOWLEDGE_INITIAL_PEEK' });
  };

  const handleTakeTwoChoice = async (cardIndex: number) => {
    await sendAction({ type: 'CHOOSE_TAKE_TWO_CARD', cardIndex });
  };

  // --- Render ---

  return (
    <GameLayout>
      {/* Top Bar: Room Info & Status */}
      <div className="flex justify-between items-center mb-4 md:mb-8 text-sm md:text-base">
         <div className="flex items-center gap-4">
             <div className="font-mono text-indigo-300">Room: {gameView.roomId}</div>
             <div className="px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700/50">
               Round {gameView.roundNumber}
             </div>
         </div>

         <div className="text-center font-bold text-lg text-indigo-100">
           {gameView.phase === 'initial_peek' && "Memorize 2 Cards"}
           {gameView.phase === 'playing' && (gameView.isMyTurn ? "Your Turn" : `${gameView.players[gameView.activePlayerIndex]?.playerName}'s Turn`)}
           {gameView.phase === 'scoring' && "Round Over - Scoring"}
           {gameView.phase === 'game_over' && "Game Over!"}
         </div>

         <div className="w-20 text-right">
            {/* Could put settings or quit here */}
         </div>
      </div>

      {/* Opponents Grid */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-5xl">
          {opponents.map(opp => (
            <PlayerZone
              key={opp.playerId}
              name={opp.playerName}
              slots={opp.dreamSlots}
              isCurrentPlayer={false}
              isActive={opp.isActivePlayer}
              score={gameView.phase !== 'playing' ? opp.roundScore : undefined}
              compact={true}
              onSlotClick={(idx) => handleSlotClick(idx, false, opp.playerId)}
            />
          ))}
        </div>
      </div>

      {/* Center Table Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] mb-8 relative">

         {/* Message/Action Overlay */}
         {gameView.phase === 'initial_peek' && !gameView.hasSeenInitialCards && (
             <div className="absolute -top-10 z-20 animate-bounce text-yellow-300 font-bold text-lg">
                {gameView.initialPeekedSlots.length < 2
                  ? `Select ${2 - gameView.initialPeekedSlots.length} cards to peek`
                  : <Button onClick={handleInitialPeekAck} className="bg-green-600 hover:bg-green-700 text-white font-bold">Ready to Start</Button>
                }
             </div>
         )}

         {/* Drawn Card Display (if any) */}
         {gameView.drawnCard && (
             <div className="absolute z-20 flex flex-col items-center gap-4 bg-black/80 p-6 rounded-2xl backdrop-blur-md border border-indigo-500/30 shadow-2xl">
                 <div className="text-indigo-200 font-medium">Drawn Card</div>
                 <Card card={gameView.drawnCard} className="w-32 scale-110" />

                 <div className="flex gap-2">
                    <div className="text-xs text-center text-indigo-300 mb-2 max-w-[150px]">
                      Click a slot to Swap
                    </div>
                 </div>

                 <div className="flex gap-3">
                    {gameView.canDiscard && (
                        <Button variant="destructive" size="sm" onClick={handleDiscardDrawn}>Discard</Button>
                    )}
                    {gameView.canUseEffect && (
                        <Button variant="secondary" size="sm" onClick={handleUseEffect} className="bg-purple-600 hover:bg-purple-700 text-white">
                           Use Power
                        </Button>
                    )}
                 </div>
             </div>
         )}

         {/* Take Two Selection */}
         {gameView.takeTwoCards && (
             <div className="absolute z-30 flex flex-col items-center gap-6 bg-black/90 p-8 rounded-2xl backdrop-blur-xl border border-yellow-500/50 shadow-2xl">
                 <h3 className="text-xl font-bold text-yellow-100">Choose One to Keep</h3>
                 <div className="flex gap-8">
                    {gameView.takeTwoCards.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                           <Card card={c} onClick={() => handleTakeTwoChoice(i)} className="cursor-pointer hover:scale-105 transition-transform" />
                           <Button size="sm" onClick={() => handleTakeTwoChoice(i)}>Keep</Button>
                        </div>
                    ))}
                 </div>
             </div>
         )}

         {/* Pending Effect Info */}
         {gameView.pendingEffect && (
            <div className="absolute top-0 bg-purple-900/80 px-4 py-2 rounded-full text-purple-100 text-sm animate-pulse">
               {gameView.pendingEffect.type === 'peek_any' && "Select ANY card to peek"}
               {gameView.pendingEffect.type === 'swap_blind' && "Select TWO cards to swap"}

               {gameView.pendingEffect.peekedCard && (
                   <div className="mt-2 p-2 bg-black/50 rounded flex flex-col items-center">
                      <span>Peeked:</span>
                      <Card card={gameView.pendingEffect.peekedCard} className="w-16" />
                      <Button size="sm" className="mt-2" onClick={() => sendAction({ type: 'CANCEL_EFFECT' })}>Done</Button>
                   </div>
               )}
            </div>
         )}

         <TableCenter
            deckCount={gameView.deckCount}
            topDiscard={gameView.topDiscard}
            onDrawDeck={handleDrawDeck}
            onDrawDiscard={handleDrawDiscard}
            onWakeUp={handleWakeUp}
            canWakeUp={gameView.isMyTurn && gameView.turnPhase === 'draw' && gameView.roundNumber > 0} // Rules imply wait at least one turn? No, rules say "At the start of their turn". Assuming roundNumber check isn't needed strictly but good for UX.
            canDrawDeck={gameView.isMyTurn && gameView.turnPhase === 'draw'}
            canDrawDiscard={gameView.isMyTurn && gameView.turnPhase === 'draw'}
            gamePhase={gameView.phase}
         />
      </div>

      {/* Player Zone (Bottom) */}
      <div className="flex justify-center pb-4 md:pb-8">
         <PlayerZone
            name="You"
            slots={gameView.myDreamSlots}
            isCurrentPlayer={true}
            isActive={gameView.isMyTurn}
            score={gameView.phase !== 'playing' ? gameView.myRoundScore : undefined}
            onSlotClick={(idx) => handleSlotClick(idx, true, playerId)}
            className="scale-110 origin-bottom"
         />
      </div>

      {/* Game Over / New Round Overlay */}
      {(gameView.phase === 'scoring' || gameView.phase === 'game_over') && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0a0b1e] border border-indigo-500/50 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
                <h2 className="text-3xl font-bold text-center text-indigo-100">
                  {gameView.phase === 'game_over' ? "Game Over" : "Round Finished"}
                </h2>

                <div className="space-y-4">
                   {gameView.players
                     .sort((a, b) => a.roundScore - b.roundScore)
                     .map(p => (
                       <div key={p.playerId} className="flex justify-between items-center p-3 bg-indigo-900/20 rounded-lg">
                          <span className="font-medium">{p.playerName}</span>
                          <div className="flex gap-4">
                             <span className="text-indigo-300">Round: {p.roundScore}</span>
                             <span className="font-bold text-indigo-100">Total: {p.totalScore}</span>
                          </div>
                       </div>
                   ))}
                </div>

                <div className="flex justify-center pt-4">
                   {gameView.phase === 'game_over' ? (
                       <Button onClick={() => navigate('/')} size="lg" className="w-full">
                          Back to Lobby
                       </Button>
                   ) : (
                       <Button onClick={newRound} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                          Start Next Round
                       </Button>
                   )}
                </div>
            </div>
         </div>
      )}

    </GameLayout>
  );
}
