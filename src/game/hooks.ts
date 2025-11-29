/**
 * Sen Card Game - React Hooks for Game State Management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  GameState, 
  PlayerAction, 
  PlayerGameView, 
  RoomInfo 
} from './types';
import { 
  createInitialGameState, 
  applyAction, 
  isActionValid, 
  derivePlayerView,
  startNewRound 
} from './logic';

// Generate a simple player ID (stored in localStorage)
export function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem('sen_player_id');
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sen_player_id', playerId);
  }
  return playerId;
}

// Generate a 4-letter room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Hook for managing player identity
export function usePlayerId() {
  const [playerId] = useState(() => getOrCreatePlayerId());
  const [playerName, setPlayerName] = useState(() => 
    localStorage.getItem('sen_player_name') || ''
  );
  
  const updatePlayerName = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem('sen_player_name', name);
  }, []);
  
  return { playerId, playerName, setPlayerName: updatePlayerName };
}

// Hook for creating a game room
export function useCreateRoom() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createRoom = useCallback(async (hostId: string, targetScore: number = 100) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const code = generateRoomCode();
      
      const { data, error: dbError } = await supabase
        .from('game_rooms')
        .insert({
          code,
          host_id: hostId,
          target_score: targetScore,
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);
  
  return { createRoom, isCreating, error };
}

// Hook for joining a game room
export function useJoinRoom() {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const joinRoom = useCallback(async (
    roomId: string, 
    playerId: string, 
    playerName: string
  ) => {
    setIsJoining(true);
    setError(null);
    
    try {
      // Get current players to determine seat
      const { data: existingPlayers } = await supabase
        .from('game_players')
        .select('seat_index')
        .eq('room_id', roomId);
      
      const usedSeats = new Set(existingPlayers?.map(p => p.seat_index) || []);
      let seatIndex = 0;
      while (usedSeats.has(seatIndex)) seatIndex++;
      
      const { data, error: dbError } = await supabase
        .from('game_players')
        .upsert({
          room_id: roomId,
          player_id: playerId,
          player_name: playerName,
          seat_index: seatIndex,
          is_connected: true,
        }, {
          onConflict: 'room_id,player_id',
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      return null;
    } finally {
      setIsJoining(false);
    }
  }, []);
  
  return { joinRoom, isJoining, error };
}

// Hook for finding a room by code
export function useFindRoom() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const findRoom = useCallback(async (code: string) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
      
      if (dbError) {
        if (dbError.code === 'PGRST116') {
          setError('Room not found');
          return null;
        }
        throw dbError;
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find room');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  return { findRoom, isSearching, error };
}

// Hook for room lobby state with realtime updates
export function useRoomLobby(roomId: string | null) {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [players, setPlayers] = useState<{ playerId: string; playerName: string; seatIndex: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }
    
    // Initial fetch
    const fetchRoom = async () => {
      const { data: roomData } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      const { data: playersData } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomId)
        .order('seat_index');
      
      if (roomData) {
        setRoom({
          id: roomData.id,
          code: roomData.code,
          hostId: roomData.host_id,
          status: roomData.status as 'lobby' | 'playing' | 'finished',
          playerCount: playersData?.length || 0,
          maxPlayers: roomData.max_players,
          targetScore: roomData.target_score,
        });
      }
      
      if (playersData) {
        setPlayers(playersData.map(p => ({
          playerId: p.player_id,
          playerName: p.player_name,
          seatIndex: p.seat_index,
        })));
      }
      
      setIsLoading(false);
    };
    
    fetchRoom();
    
    // Subscribe to room changes
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          const newRoom = payload.new as any;
          setRoom(prev => prev ? {
            ...prev,
            status: newRoom.status,
          } : null);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `room_id=eq.${roomId}`,
      }, async () => {
        // Refetch players on any change
        const { data } = await supabase
          .from('game_players')
          .select('*')
          .eq('room_id', roomId)
          .order('seat_index');
        
        if (data) {
          setPlayers(data.map(p => ({
            playerId: p.player_id,
            playerName: p.player_name,
            seatIndex: p.seat_index,
          })));
          setRoom(prev => prev ? { ...prev, playerCount: data.length } : null);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId]);
  
  return { room, players, isLoading };
}

// Hook for starting a game
export function useStartGame() {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startGame = useCallback(async (
    roomId: string,
    players: { playerId: string; playerName: string }[],
    targetScore: number
  ) => {
    setIsStarting(true);
    setError(null);
    
    try {
      // Create initial game state
      const initialState = createInitialGameState(roomId, players, targetScore);
      
      // Save game state
      const { error: stateError } = await supabase
        .from('game_states')
        .insert({
          room_id: roomId,
          state: initialState as any,
          version: 1,
        });
      
      if (stateError) throw stateError;
      
      // Update room status
      const { error: roomError } = await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', roomId);
      
      if (roomError) throw roomError;
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      return false;
    } finally {
      setIsStarting(false);
    }
  }, []);
  
  return { startGame, isStarting, error };
}

// Main hook for game state with realtime updates
export function useGameState(roomId: string | null, playerId: string) {
  const [gameView, setGameView] = useState<PlayerGameView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch and derive view from state
  const refreshState = useCallback(async () => {
    if (!roomId) return;
    
    const { data, error: dbError } = await supabase
      .from('game_states')
      .select('state')
      .eq('room_id', roomId)
      .single();
    
    if (dbError) {
      if (dbError.code !== 'PGRST116') {
        setError(dbError.message);
      }
      return;
    }
    
    if (data?.state) {
      const fullState = data.state as unknown as GameState;
      const view = derivePlayerView(fullState, playerId);
      setGameView(view);
    }
    
    setIsLoading(false);
  }, [roomId, playerId]);
  
  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }
    
    refreshState();
    
    // Subscribe to game state changes
    const channel = supabase
      .channel(`game-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_states',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        refreshState();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refreshState]);
  
  // Send action to server
  const sendAction = useCallback(async (action: PlayerAction) => {
    if (!roomId) return false;
    
    try {
      // Fetch current state
      const { data, error: fetchError } = await supabase
        .from('game_states')
        .select('state, version')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentState = data.state as unknown as GameState;
      
      // Validate and apply action
      if (!isActionValid(currentState, playerId, action)) {
        console.warn('Invalid action:', action);
        return false;
      }
      
      const newState = applyAction(currentState, playerId, action);
      
      // Update state in database
      const { error: updateError } = await supabase
        .from('game_states')
        .update({ 
          state: newState as any,
          version: newState.version,
        })
        .eq('room_id', roomId)
        .eq('version', data.version);
      
      if (updateError) throw updateError;
      
      // Update local view immediately
      setGameView(derivePlayerView(newState, playerId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send action');
      return false;
    }
  }, [roomId, playerId]);
  
  // Start new round
  const newRound = useCallback(async () => {
    if (!roomId) return false;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('game_states')
        .select('state, version')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentState = data.state as unknown as GameState;
      const newState = startNewRound(currentState);
      
      const { error: updateError } = await supabase
        .from('game_states')
        .update({ 
          state: newState as any,
          version: newState.version,
        })
        .eq('room_id', roomId);
      
      if (updateError) throw updateError;
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new round');
      return false;
    }
  }, [roomId]);
  
  return { gameView, isLoading, error, sendAction, newRound };
}
