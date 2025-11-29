/**
 * Score Board Component
 * Shows round and game scores
 */

import { PublicPlayerView } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Bird, Trophy, Crown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  players: PublicPlayerView[];
  myPlayerId: string;
  roundNumber: number;
  isGameOver: boolean;
  wakeUpCalledBy: string | null;
  onNewRound: () => void;
}

export function ScoreBoard({
  players,
  myPlayerId,
  roundNumber,
  isGameOver,
  wakeUpCalledBy,
  onNewRound,
}: ScoreBoardProps) {
  // Sort players by total score (lowest first is winner)
  const sortedByTotal = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const sortedByRound = [...players].sort((a, b) => a.roundScore - b.roundScore);
  const roundWinner = sortedByRound[0];
  const gameWinner = isGameOver ? sortedByTotal[0] : null;
  
  const wakeUpPlayer = players.find(p => p.playerId === wakeUpCalledBy);
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          {isGameOver ? (
            <>
              <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Game Over!</h1>
              <p className="text-lg text-muted-foreground">
                {gameWinner?.playerName} wins with {gameWinner?.totalScore} crows!
              </p>
            </>
          ) : (
            <>
              <Bird className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Round {roundNumber} Complete</h1>
              {wakeUpPlayer && (
                <p className="text-muted-foreground">
                  {wakeUpPlayer.playerName} called Pobudka!
                </p>
              )}
            </>
          )}
        </div>
        
        {/* Round scores */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bird className="w-5 h-5" />
            Round {roundNumber} Results
          </h2>
          
          <div className="space-y-3">
            {sortedByRound.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  index === 0 && "bg-emerald-500/10 border border-emerald-500/30",
                  player.playerId === myPlayerId && "ring-2 ring-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {index === 0 && <Crown className="w-4 h-4 text-emerald-500" />}
                  <span className={cn(
                    "font-medium",
                    player.playerId === myPlayerId && "text-primary"
                  )}>
                    {player.playerName}
                    {player.playerId === myPlayerId && " (You)"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {player.dreamSlots.map((slot, i) => (
                      <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {slot.card?.visible?.crowValue ?? '?'}
                      </span>
                    ))}
                  </div>
                  <span className={cn(
                    "font-bold text-lg",
                    index === 0 && "text-emerald-600"
                  )}>
                    {player.roundScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Total scores */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Total Scores</h2>
          
          <div className="space-y-2">
            {sortedByTotal.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isGameOver && index === 0 && "bg-amber-500/10 border border-amber-500/30",
                  player.playerId === myPlayerId && "ring-2 ring-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {isGameOver && index === 0 && (
                    <Trophy className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-lg font-medium">#{index + 1}</span>
                  <span className={cn(
                    player.playerId === myPlayerId && "text-primary font-medium"
                  )}>
                    {player.playerName}
                    {player.playerId === myPlayerId && " (You)"}
                  </span>
                </div>
                <span className={cn(
                  "text-xl font-bold",
                  isGameOver && index === 0 && "text-amber-600"
                )}>
                  {player.totalScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Continue button */}
        {!isGameOver && (
          <div className="text-center">
            <Button onClick={onNewRound} size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Round {roundNumber + 1}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
