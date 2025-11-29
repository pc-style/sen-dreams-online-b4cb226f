import { useMutation, useQuery, useConvex } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  GameState,
  PlayerAction,
  PlayerGameView,
  RoomInfo,
} from "./types";
import {
  createInitialGameState,
  applyAction,
  isActionValid,
  derivePlayerView,
  startNewRound as startNewRoundLogic,
} from "./logic";

export function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem("sen_player_id");
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("sen_player_id", playerId);
  }
  return playerId;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function usePlayerId() {
  const [playerId] = useState(() => getOrCreatePlayerId());
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem("sen_player_name") || ""
  );

  const updatePlayerName = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem("sen_player_name", name);
  }, []);

  return { playerId, playerName, setPlayerName: updatePlayerName };
}

export function useCreateRoom() {
  const createRoomMutation = useMutation(api.rooms.createRoom);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = useCallback(
    async (hostId: string, targetScore: number = 100) => {
      setIsCreating(true);
      setError(null);

      try {
        const code = generateRoomCode();
        const roomId = await createRoomMutation({
          code,
          hostId,
          targetScore,
        });
        return { id: roomId, code };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create room");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [createRoomMutation]
  );

  return { createRoom, isCreating, error };
}

export function useJoinRoom() {
  const addPlayerMutation = useMutation(api.players.addPlayer);
  const convex = useConvex();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = useCallback(
    async (roomId: string | Id<"rooms">, playerId: string, playerName: string) => {
      setIsJoining(true);
      setError(null);

      try {
        const roomIdTyped = roomId as Id<"rooms">;
        const usedSeatsData = await convex.query(api.players.getUsedSeats, { roomId: roomIdTyped });
        const usedSeats = usedSeatsData || [];
        let seatIndex = 0;
        while (usedSeats.includes(seatIndex)) seatIndex++;

        const playerId_id = await addPlayerMutation({
          roomId: roomIdTyped,
          playerId,
          playerName,
          seatIndex,
        });

        return { id: playerId_id };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
        return null;
      } finally {
        setIsJoining(false);
      }
    },
    [addPlayerMutation, convex]
  );

  return { joinRoom, isJoining, error };
}

export function useFindRoom() {
  const convex = useConvex();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRoom = useCallback(
    async (code: string) => {
      setIsSearching(true);
      setError(null);

      try {
        const room = await convex.query(api.rooms.findRoomByCode, { code: code.toUpperCase() });
        if (!room) {
          setError("Room not found");
          return null;
        }
        return room;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to find room");
        return null;
      } finally {
        setIsSearching(false);
      }
    },
    [convex]
  );

  return { findRoom, isSearching, error };
}

export function useRoomLobby(roomId: string | Id<"rooms"> | null) {
  const roomIdTyped = roomId ? (roomId as Id<"rooms">) : null;
  const room = useQuery(api.rooms.getRoom, roomIdTyped ? { roomId: roomIdTyped } : "skip");
  const players = useQuery(
    api.players.getPlayersByRoom,
    roomIdTyped ? { roomId: roomIdTyped } : "skip"
  );

  const roomInfo: RoomInfo | null = room
    ? {
        id: room._id,
        code: room.code,
        hostId: room.hostId,
        status: room.status,
        playerCount: players?.length || 0,
        maxPlayers: room.maxPlayers,
        targetScore: room.targetScore,
      }
    : null;

  const playersList =
    players?.map((p) => ({
      playerId: p.playerId,
      playerName: p.playerName,
      seatIndex: p.seatIndex,
    })) || [];

  return { room: roomInfo, players: playersList, isLoading: room === undefined };
}

export function useStartGame() {
  const createGameStateMutation = useMutation(api.gameStates.createGameState);
  const updateRoomStatusMutation = useMutation(api.rooms.updateRoomStatus);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(
    async (
      roomId: string | Id<"rooms">,
      players: { playerId: string; playerName: string }[],
      targetScore: number
    ) => {
      setIsStarting(true);
      setError(null);

      try {
        const roomIdTyped = roomId as Id<"rooms">;
        const initialState = createInitialGameState(
          roomIdTyped as unknown as string,
          players,
          targetScore
        );

        await createGameStateMutation({
          roomId: roomIdTyped,
          state: initialState as any,
        });

        await updateRoomStatusMutation({
          roomId: roomIdTyped,
          status: "playing",
        });

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start game");
        return false;
      } finally {
        setIsStarting(false);
      }
    },
    [createGameStateMutation, updateRoomStatusMutation]
  );

  return { startGame, isStarting, error };
}

export function useGameState(roomId: string | Id<"rooms"> | null, playerId: string) {
  const roomIdTyped = roomId ? (roomId as Id<"rooms">) : null;
  const gameStateData = useQuery(
    api.gameStates.getGameState,
    roomIdTyped ? { roomId: roomIdTyped } : "skip"
  );
  const updateGameStateMutation = useMutation(api.gameStates.updateGameState);

  const [error, setError] = useState<string | null>(null);

  const gameView: PlayerGameView | null =
    gameStateData?.state
      ? derivePlayerView(gameStateData.state as GameState, playerId)
      : null;

  const sendAction = useCallback(
    async (action: PlayerAction) => {
      if (!roomIdTyped || !gameStateData) return false;

      try {
        const currentState = gameStateData.state as GameState;

        if (!isActionValid(currentState, playerId, action)) {
          console.warn("Invalid action:", action);
          return false;
        }

        const newState = applyAction(currentState, playerId, action);

        await updateGameStateMutation({
          roomId: roomIdTyped,
          state: newState as any,
          version: newState.version,
        });

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send action");
        return false;
      }
    },
    [roomIdTyped, gameStateData, playerId, updateGameStateMutation]
  );

  const newRound = useCallback(async () => {
    if (!roomIdTyped || !gameStateData) return false;

    try {
      const currentState = gameStateData.state as GameState;
      const newState = startNewRoundLogic(currentState);

      await updateGameStateMutation({
        roomId: roomIdTyped,
        state: newState as any,
        version: newState.version,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start new round");
      return false;
    }
  }, [roomIdTyped, gameStateData, updateGameStateMutation]);

  return {
    gameView,
    isLoading: gameStateData === undefined,
    error,
    sendAction,
    newRound,
  };
}