/**
 * Sen Card Game - Landing Page
 * Clean, neutral design
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayerId, useCreateRoom, useFindRoom, useJoinRoom } from '@/game/hooks';
import { Moon, Users, Play, Sparkles } from 'lucide-react';
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

      await joinRoom(room._id, playerId, playerName);
      navigate(`/lobby/${room._id}`);
    } else {
      toast({
        title: 'Room not found',
        description: 'No room exists with that code',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Logo and title */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Moon className="w-12 h-12 text-primary" />
              </div>
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-primary animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                Sen
              </h1>
              <p className="text-lg text-muted-foreground mt-3">
                A game of dreams, memory, and hidden cards
              </p>
            </div>
          </div>
          
          {/* Main card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            {/* Name input */}
            <div className="space-y-2 mb-6">
              <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center text-lg bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Game'}
                </Button>
                <Button
                  onClick={() => setShowJoin(true)}
                  variant="outline"
                  size="lg"
                  className="w-full border-border text-foreground hover:bg-muted"
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
                  className="text-center text-lg uppercase tracking-widest bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
                  maxLength={4}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowJoin(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1 border-border text-foreground hover:bg-muted"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isSearching || isJoining}
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSearching || isJoining ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Game info */}
          <div className="pt-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">How to Play</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                  <span className="text-lg">🐱</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Collect low<br />cat cards</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Remember<br />your dreams</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Call Pobudka!<br />to win</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        2-5 Players • Real-time Multiplayer
      </footer>
    </main>
  );
}