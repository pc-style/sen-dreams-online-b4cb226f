/**
 * Game Lobby - Dreamy themed
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlayerId, useRoomLobby, useStartGame, useJoinRoom } from '@/game/hooks';
import { Moon, Users, Copy, Play, Crown, Loader2, Star } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Moon className="w-12 h-12 mx-auto text-purple-400" />
          <h1 className="text-2xl font-bold text-purple-100">Room Not Found</h1>
          <p className="text-purple-300/70">This room doesn't exist or has expired</p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-500">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-6 relative overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-[10%] w-2 h-2 text-yellow-200/30 animate-pulse" />
        <Star className="absolute top-32 right-[15%] w-1.5 h-1.5 text-yellow-200/20 animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
            <Moon className="w-7 h-7 text-purple-300" />
          </div>
          <h1 className="text-2xl font-bold text-purple-100">Game Lobby</h1>
        </div>
        
        {/* Room code */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-purple-300/60 mb-1">Room Code</p>
          <button
            onClick={copyRoomCode}
            className="flex items-center justify-center gap-2 mx-auto group"
          >
            <span className="text-3xl font-bold tracking-widest text-purple-100">{room.code}</span>
            <Copy className="w-4 h-4 text-purple-400 group-hover:text-purple-200 transition-colors" />
          </button>
          <p className="text-xs text-purple-300/50 mt-1">Share to invite friends</p>
        </div>
        
        {/* Players */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-purple-200 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Players
            </h2>
            <span className="text-xs text-purple-300/60">
              {players.length}/{room.maxPlayers}
            </span>
          </div>
          
          <div className="space-y-1.5">
            {players.map((player) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  player.playerId === playerId ? "bg-purple-500/20" : "bg-slate-800/50"
                )}
              >
                <span className="text-sm text-purple-200 truncate">
                  {player.playerName}
                  {player.playerId === playerId && " (You)"}
                </span>
                <div className="flex items-center gap-2">
                  {player.playerId === room.hostId && (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-xs text-purple-300/60">#{player.seatIndex + 1}</span>
                </div>
              </div>
            ))}
            
            {Array.from({ length: room.maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-2 rounded-lg border border-dashed border-purple-500/20"
              >
                <span className="text-xs text-purple-300/40">Waiting...</span>
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
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isStarting ? 'Starting...' : 'Start Game'}
            </Button>
            {players.length < 2 && (
              <p className="text-xs text-purple-300/50 text-center">
                Need at least 2 players
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-purple-300/60 text-sm">
            Waiting for host to start...
          </p>
        )}
        
        <Button
          variant="ghost"
          className="w-full text-purple-400 hover:text-purple-200 hover:bg-purple-500/10"
          onClick={() => navigate('/')}
        >
          Leave Lobby
        </Button>
      </div>
    </div>
  );
}
