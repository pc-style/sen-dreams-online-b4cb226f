/**
 * Game Lobby Page
 * Wait for players and start the game
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlayerId, useRoomLobby, useStartGame, useJoinRoom } from '@/game/hooks';
import { Moon, Users, Copy, Play, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerId, playerName } = usePlayerId();
  const { room, players, isLoading } = useRoomLobby(roomId || null);
  const { startGame, isStarting } = useStartGame();
  const { joinRoom } = useJoinRoom();
  
  const isHost = room?.hostId === playerId;
  const isInRoom = players.some(p => p.playerId === playerId);
  const canStart = players.length >= 2 && isHost;
  
  // Auto-join if not in room yet
  useEffect(() => {
    if (roomId && !isLoading && !isInRoom && playerName) {
      joinRoom(roomId, playerId, playerName);
    }
  }, [roomId, isLoading, isInRoom, playerId, playerName, joinRoom]);
  
  // Redirect to game when it starts
  useEffect(() => {
    if (room?.status === 'playing') {
      navigate(`/game/${roomId}`);
    }
  }, [room?.status, roomId, navigate]);
  
  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast({
        title: 'Copied!',
        description: `Room code ${room.code} copied to clipboard`,
      });
    }
  };
  
  const handleStartGame = async () => {
    if (!roomId || !canStart) return;
    
    const gamePlayers = players.map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
    }));
    
    const success = await startGame(roomId, gamePlayers, room?.targetScore || 100);
    if (success) {
      navigate(`/game/${roomId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Moon className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Room Not Found</h1>
          <p className="text-muted-foreground">This room doesn't exist or has expired</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Moon className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Game Lobby</h1>
        </div>
        
        {/* Room code */}
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Room Code</p>
          <button
            onClick={copyRoomCode}
            className="flex items-center justify-center gap-2 mx-auto group"
          >
            <span className="text-4xl font-bold tracking-widest">{room.code}</span>
            <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <p className="text-sm text-muted-foreground mt-2">
            Share this code with friends to join
          </p>
        </div>
        
        {/* Players list */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players
            </h2>
            <span className="text-sm text-muted-foreground">
              {players.length}/{room.maxPlayers}
            </span>
          </div>
          
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  player.playerId === playerId ? "bg-primary/10" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {player.playerName}
                    {player.playerId === playerId && " (You)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {player.playerId === room.hostId && (
                    <Crown className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Seat {player.seatIndex + 1}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: room.maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted-foreground/20"
              >
                <span className="text-sm text-muted-foreground">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Game settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Game Settings</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target Score</span>
            <span className="font-medium">{room.targetScore} crows</span>
          </div>
        </div>
        
        {/* Start button */}
        {isHost ? (
          <div className="space-y-3">
            <Button
              onClick={handleStartGame}
              disabled={!canStart || isStarting}
              size="lg"
              className="w-full"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </>
              )}
            </Button>
            {players.length < 2 && (
              <p className="text-sm text-muted-foreground text-center">
                Need at least 2 players to start
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Waiting for the host to start the game...</p>
          </div>
        )}
        
        {/* Leave button */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate('/')}
        >
          Leave Lobby
        </Button>
      </div>
    </div>
  );
}
