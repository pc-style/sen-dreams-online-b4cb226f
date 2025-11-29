import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    code: v.string(),
    hostId: v.string(),
    targetScore: v.number(),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      code: args.code,
      hostId: args.hostId,
      status: "lobby",
      targetScore: args.targetScore,
      maxPlayers: 4,
    });
    return roomId;
  },
});

export const findRoomByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    return room;
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

export const updateRoomStatus = mutation({
  args: {
    roomId: v.id("rooms"),
    status: v.union(v.literal("lobby"), v.literal("playing"), v.literal("finished")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { status: args.status });
  },
});
