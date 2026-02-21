import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// タスク一覧取得
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

// ステータス別タスク取得
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

// 担当者別タスク取得
export const listByAssignee = query({
  args: { assignee: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee as any))
      .collect();
  },
});

// タスク作成
export const create = mutation({
  args: {
    title: v.string(),
    assignee: v.union(v.literal("ray"), v.literal("claude"), v.literal("both")),
    priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
    tag: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
    });

    // 作成ログを追加
    await ctx.db.insert("logs", {
      taskId,
      author: "ray",
      message: "タスクを作成しました",
    });

    return taskId;
  },
});

// ステータス更新
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("waiting_ray"),
      v.literal("done")
    ),
    author: v.union(v.literal("ray"), v.literal("claude")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, status, author, message } = args;

    await ctx.db.patch(id, { status });

    // ステータス変更ログを追加
    const statusLabels = {
      todo: "Todo",
      in_progress: "作業中",
      waiting_ray: "Ray確認待ち",
      done: "完了",
    };

    await ctx.db.insert("logs", {
      taskId: id,
      author,
      message: message || `ステータスを「${statusLabels[status]}」に変更しました`,
    });
  },
});

// タスク更新
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    assignee: v.optional(v.union(v.literal("ray"), v.literal("claude"), v.literal("both"))),
    priority: v.optional(v.union(v.literal("high"), v.literal("mid"), v.literal("low"))),
    tag: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

// タスク削除
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    // 関連ログも削除
    const logs = await ctx.db
      .query("logs")
      .withIndex("by_task", (q) => q.eq("taskId", args.id))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.id);
  },
});

// サマリー取得（ヘッダー表示用）
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();

    return {
      claude: tasks.filter(t => t.assignee === "claude" && t.status !== "done").length,
      ray: tasks.filter(t => t.assignee === "ray" && t.status !== "done").length,
      both: tasks.filter(t => t.assignee === "both" && t.status !== "done").length,
      waitingRay: tasks.filter(t => t.status === "waiting_ray").length,
      total: tasks.filter(t => t.status !== "done").length,
    };
  },
});
