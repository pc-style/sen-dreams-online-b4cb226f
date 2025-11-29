import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createGameState = mutation({
  args: {
    roomId: v.id("rooms"),
    state: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gameStates", {
      roomId: args.roomId,
      state: args.state,
      version: 1,
    });
  },
});

export const getGameState = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameStates")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();
  },
});

export const updateGameState = mutation({
  args: {
    roomId: v.id("rooms"),
    state: v.any(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gameStates")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!existing) {
      throw new Error("Game state not found");
    }

    if (existing.version !== args.version - 1) {
      throw new Error("Version conflict");
    }

    await ctx.db.patch(existing._id, {
      state: args.state,
      version: args.version,
    });
  },
});
