/**
 * Sen Card Game - Landing Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayerId, useCreateRoom, useFindRoom, useJoinRoom } from '@/game/hooks';
import { Moon, Users, Play, Bird, Sparkles, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerId, playerName, setPlayerName } = usePlayerId();
  const { createRoom, isCreating } = useCreateRoom();
  const { findRoom, isSearching } = useFindRoom();
  const { joinRoom, isJoining } = useJoinRoom();
  
  const [roomCode, setRoomCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Enter your name',
        description: 'Please enter a name before creating a room',
        variant: 'destructive',
      });
      return;
    }
    
    const room = await createRoom(playerId);
    if (room) {
      await joinRoom(room.id, playerId, playerName);
      navigate(`/lobby/${room.id}`);
    }
  };
  
  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Enter your name',
        description: 'Please enter a name before joining',
        variant: 'destructive',
      });
      return;
    }
    
    if (!roomCode.trim()) {
      toast({
        title: 'Enter room code',
        description: 'Please enter the 4-letter room code',
        variant: 'destructive',
      });
      return;
    }
    
    const room = await findRoom(roomCode);
    if (room) {
      if (room.status !== 'lobby') {
        toast({
          title: 'Game in progress',
          description: 'This game has already started',
          variant: 'destructive',
        });
        return;
      }
      
      await joinRoom(room.id, playerId, playerName);
      navigate(`/lobby/${room.id}`);
    } else {
      toast({
        title: 'Room not found',
        description: 'No room exists with that code',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-[10%] w-3 h-3 text-yellow-200/40 animate-pulse" />
        <Star className="absolute top-32 right-[15%] w-2 h-2 text-yellow-200/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-48 left-[25%] w-2 h-2 text-purple-300/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <Star className="absolute top-24 right-[30%] w-3 h-3 text-blue-200/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Star className="absolute bottom-32 left-[20%] w-2 h-2 text-yellow-200/30 animate-pulse" style={{ animationDelay: '0.7s' }} />
        <Star className="absolute bottom-48 right-[25%] w-3 h-3 text-purple-300/30 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-600/20 backdrop-blur-sm flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/20">
                <Moon className="w-12 h-12 text-purple-200" />
              </div>
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              <Sparkles className="w-4 h-4 absolute -bottom-1 -left-2 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div>
              <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
                Sen
              </h1>
              <p className="text-lg text-purple-200/70 mt-3">
                A game of dreams, memory, and hidden cards
              </p>
            </div>
          </div>
          
          {/* Main card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-900/30">
            {/* Name input */}
            <div className="space-y-2 mb-6">
              <label htmlFor="name" className="text-sm font-medium text-purple-200/80">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center text-lg bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
                maxLength={20}
              />
            </div>
            
            {/* Action buttons */}
            {!showJoin ? (
              <div className="space-y-3">
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-600/30"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Game'}
                </Button>
                <Button
                  onClick={() => setShowJoin(true)}
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent border-purple-500/40 text-purple-200 hover:bg-purple-500/10 hover:border-purple-400/60 hover:text-purple-100"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Game
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter room code (e.g., ABCD)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-center text-lg uppercase tracking-widest bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/40 focus:border-purple-400"
                  maxLength={4}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowJoin(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-transparent border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isSearching || isJoining}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0"
                  >
                    {isSearching || isJoining ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Game info */}
          <div className="pt-6">
            <h2 className="text-sm font-medium text-purple-300/60 mb-5">How to Play</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
                  <Bird className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-xs text-purple-200/60 leading-relaxed">Collect low<br />crow cards</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
                  <Moon className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-xs text-purple-200/60 leading-relaxed">Remember<br />your dreams</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-xs text-purple-200/60 leading-relaxed">Call Pobudka!<br />to win</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-purple-300/40 relative z-10">
        2-4 Players • Real-time Multiplayer
      </footer>
    </main>
  );
}
