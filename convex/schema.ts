import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("waiting_ray"),
      v.literal("done")
    ),
    assignee: v.union(
      v.literal("ray"),
      v.literal("claude"),
      v.literal("both")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("mid"),
      v.literal("low")
    ),
    tag: v.optional(v.string()),
    note: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  logs: defineTable({
    taskId: v.id("tasks"),
    author: v.union(v.literal("ray"), v.literal("claude")),
    message: v.string(),
  }).index("by_task", ["taskId"]),
});
