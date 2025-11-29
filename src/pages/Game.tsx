/**
 * Main Game Page
 * Real-time gameplay with hidden information
 */

import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerId, useGameState } from '@/game/hooks';
import { GameBoard } from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { Moon, Loader2, ArrowLeft } from 'lucide-react';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { playerId } = usePlayerId();
  const { gameView, isLoading, error, sendAction, newRound } = useGameState(roomId || null, playerId);
  
  if (isLoading) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Moon className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Game Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!gameView) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Moon className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Game Not Found</h1>
          <p className="text-muted-foreground">This game doesn't exist or hasn't started yet</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <GameBoard
      gameView={gameView}
      onAction={sendAction}
      onNewRound={newRound}
    />
  );
}
