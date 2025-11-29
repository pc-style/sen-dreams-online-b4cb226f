/**
 * Score Board - Dreamy themed
 */

import { PublicPlayerView } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Cat, Trophy, Crown, RefreshCw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  players: PublicPlayerView[];
  myPlayerId: string;
  roundNumber: number;
  isGameOver: boolean;
  onNewRound: () => void;
}

export function ScoreBoard({
  players,
  myPlayerId,
  roundNumber,
  isGameOver,
  onNewRound,
}: ScoreBoardProps) {
  const sortedByTotal = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const sortedByRound = [...players].sort((a, b) => a.roundScore - b.roundScore);
  const gameWinner = isGameOver ? sortedByTotal[0] : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-[15%] w-2 h-2 text-yellow-200/30 animate-pulse" />
        <Star className="absolute top-32 right-[20%] w-1.5 h-1.5 text-yellow-200/20 animate-pulse" />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          {isGameOver ? (
            <>
              <Trophy className="w-12 h-12 mx-auto text-amber-400 mb-3" />
              <h1 className="text-2xl font-bold text-purple-100 mb-1">Game Over!</h1>
              <p className="text-purple-300/70">
                {gameWinner?.playerName} wins with {gameWinner?.totalScore} cats!
              </p>
            </>
          ) : (
            <>
              <Cat className="w-10 h-10 mx-auto text-purple-300 mb-3" />
              <h1 className="text-xl font-bold text-purple-100 mb-1">Round {roundNumber} Complete</h1>
            </>
          )}
        </div>
        
        {/* Round scores */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
            <Cat className="w-4 h-4" />
            Round {roundNumber}
          </h2>
          
          <div className="space-y-2">
            {sortedByRound.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  index === 0 && "bg-emerald-500/10 border border-emerald-500/30",
                  player.playerId === myPlayerId && "ring-1 ring-purple-400/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-3 h-3 text-emerald-400" />}
                  <span className={cn(
                    "text-sm",
                    player.playerId === myPlayerId ? "text-purple-200 font-medium" : "text-purple-300/80"
                  )}>
                    {player.playerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {player.dreamSlots.map((slot, i) => (
                      <span key={i} className="text-[10px] bg-slate-700/50 px-1 py-0.5 rounded text-purple-200">
                        {slot.card?.visible?.crowValue ?? '?'}
                      </span>
                    ))}
                  </div>
                  <span className={cn(
                    "font-bold text-sm",
                    index === 0 ? "text-emerald-400" : "text-purple-200"
                  )}>
                    {player.roundScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Total scores */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-purple-200 mb-3">Total Scores</h2>
          
          <div className="space-y-1.5">
            {sortedByTotal.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  isGameOver && index === 0 && "bg-amber-500/10 border border-amber-500/30",
                  player.playerId === myPlayerId && "ring-1 ring-purple-400/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {isGameOver && index === 0 && <Trophy className="w-4 h-4 text-amber-400" />}
                  <span className="text-purple-300/60 text-sm">#{index + 1}</span>
                  <span className={cn(
                    "text-sm",
                    player.playerId === myPlayerId && "text-purple-200 font-medium"
                  )}>
                    {player.playerName}
                  </span>
                </div>
                <span className={cn(
                  "font-bold",
                  isGameOver && index === 0 ? "text-amber-400" : "text-purple-200"
                )}>
                  {player.totalScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {!isGameOver && (
          <Button 
            onClick={onNewRound} 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Next Round
          </Button>
        )}
      </div>
    </div>
  );
}
