import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addPlayer = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
    playerName: v.string(),
    seatIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) =>
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        playerName: args.playerName,
        seatIndex: args.seatIndex,
        isConnected: true,
      });
      return existing._id;
    }

    return await ctx.db.insert("players", {
      roomId: args.roomId,
      playerId: args.playerId,
      playerName: args.playerName,
      seatIndex: args.seatIndex,
      isConnected: true,
    });
  },
});

export const getPlayersByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getUsedSeats = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    return players.map((p) => p.seatIndex);
  },
});
