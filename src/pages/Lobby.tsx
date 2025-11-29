/**
 * Game Lobby - Clean, neutral design
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
  
  useEffect(() => {
    if (roomId && !isLoading && !isInRoom && playerName) {
      joinRoom(roomId, playerId, playerName);
    }
  }, [roomId, isLoading, isInRoom, playerId, playerName, joinRoom]);
  
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
          <h1 className="text-2xl font-bold text-foreground">Room Not Found</h1>
          <p className="text-muted-foreground">This room doesn't exist or has expired</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Moon className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Game Lobby</h1>
        </div>
        
        {/* Room code */}
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Room Code</p>
          <button
            onClick={copyRoomCode}
            className="flex items-center justify-center gap-2 mx-auto group"
          >
            <span className="text-3xl font-bold tracking-widest text-foreground">{room.code}</span>
            <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <p className="text-xs text-muted-foreground mt-1">Share to invite friends</p>
        </div>
        
        {/* Players */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Players
            </h2>
            <span className="text-xs text-muted-foreground">
              {players.length}/{room.maxPlayers}
            </span>
          </div>
          
          <div className="space-y-1.5">
            {players.map((player) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg",
                  player.playerId === playerId ? "bg-primary/10" : "bg-muted/50"
                )}
              >
                <span className="text-sm text-foreground truncate">
                  {player.playerName}
                  {player.playerId === playerId && <span className="text-muted-foreground ml-1">(You)</span>}
                </span>
                <div className="flex items-center gap-2">
                  {player.playerId === room.hostId && (
                    <Crown className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">#{player.seatIndex + 1}</span>
                </div>
              </div>
            ))}
            
            {Array.from({ length: room.maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-2.5 rounded-lg border border-dashed border-border"
              >
                <span className="text-xs text-muted-foreground">Waiting...</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Start button */}
        {isHost ? (
          <div className="space-y-2">
            <Button
              onClick={handleStartGame}
              disabled={!canStart || isStarting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isStarting ? 'Starting...' : 'Start Game'}
            </Button>
            {players.length < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Need at least 2 players
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm">
            Waiting for host to start...
          </p>
        )}
        
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => navigate('/')}
        >
          Leave Lobby
        </Button>
      </div>
    </div>
  );
}
