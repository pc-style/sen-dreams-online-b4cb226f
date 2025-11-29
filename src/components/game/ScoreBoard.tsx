/**
 * Score Board - Clean, neutral design
 */

import { PublicPlayerView } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, RefreshCw } from 'lucide-react';
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
    <div className="min-h-screen-safe bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          {isGameOver ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Game Over!</h1>
              <p className="text-muted-foreground">
                {gameWinner?.playerName} wins with {gameWinner?.totalScore} points!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">Round {roundNumber} Complete</h1>
              <p className="text-muted-foreground text-sm">See how everyone did</p>
            </>
          )}
        </div>
        
        {/* Round scores */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Round {roundNumber} Results
          </h2>
          
          <div className="space-y-2">
            {sortedByRound.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg transition-colors",
                  index === 0 && "bg-game-success/10 border border-game-success/30",
                  player.playerId === myPlayerId && index !== 0 && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-4 h-4 text-game-success" />}
                  <span className={cn(
                    "text-sm",
                    player.playerId === myPlayerId ? "text-foreground font-medium" : "text-foreground/80"
                  )}>
                    {player.playerName}
                    {player.playerId === myPlayerId && <span className="text-muted-foreground ml-1">(You)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Card values */}
                  <div className="flex gap-1">
                    {player.dreamSlots.map((slot, i) => (
                      <span 
                        key={i} 
                        className={cn(
                          "text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono",
                          slot.card?.visible?.crowValue !== undefined && slot.card.visible.crowValue <= 2 && "text-game-success",
                          slot.card?.visible?.crowValue !== undefined && slot.card.visible.crowValue > 5 && "text-game-danger"
                        )}
                      >
                        {slot.card?.visible?.crowValue ?? '?'}
                      </span>
                    ))}
                  </div>
                  <span className={cn(
                    "font-bold text-sm min-w-[2rem] text-right",
                    index === 0 ? "text-game-success" : "text-foreground"
                  )}>
                    {player.roundScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Total scores */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Total Scores</h2>
          
          <div className="space-y-1.5">
            {sortedByTotal.map((player, index) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg",
                  isGameOver && index === 0 && "bg-primary/10 border border-primary/30",
                  player.playerId === myPlayerId && !(isGameOver && index === 0) && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {isGameOver && index === 0 && <Trophy className="w-4 h-4 text-primary" />}
                  <span className="text-muted-foreground text-sm">#{index + 1}</span>
                  <span className={cn(
                    "text-sm",
                    player.playerId === myPlayerId && "text-foreground font-medium"
                  )}>
                    {player.playerName}
                  </span>
                </div>
                <span className={cn(
                  "font-bold",
                  isGameOver && index === 0 ? "text-primary" : "text-foreground"
                )}>
                  {player.totalScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Next round button */}
        {!isGameOver && (
          <Button 
            onClick={onNewRound} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Next Round
          </Button>
        )}
      </div>
    </div>
  );
}
