import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    hostId: v.string(),
    status: v.union(v.literal("lobby"), v.literal("playing"), v.literal("finished")),
    targetScore: v.number(),
    maxPlayers: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    roomId: v.id("rooms"),
    playerId: v.string(),
    playerName: v.string(),
    seatIndex: v.number(),
    isConnected: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_player", ["roomId", "playerId"]),

  gameStates: defineTable({
    roomId: v.id("rooms"),
    state: v.any(),
    version: v.number(),
  }).index("by_room", ["roomId"]),
});
