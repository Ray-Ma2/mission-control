import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// タスクに紐づくログ取得
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("logs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// 最新ログ取得（タイムライン表示用）
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("logs")
      .order("desc")
      .take(args.limit || 20);

    // タスク情報も取得して返す
    const logsWithTasks = await Promise.all(
      logs.map(async (log) => {
        const task = await ctx.db.get(log.taskId);
        return {
          ...log,
          taskTitle: task?.title || "削除済みタスク",
        };
      })
    );

    return logsWithTasks;
  },
});

// ログ追加
export const add = mutation({
  args: {
    taskId: v.id("tasks"),
    author: v.union(v.literal("ray"), v.literal("claude")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("logs", args);
  },
});
