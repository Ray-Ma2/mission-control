import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

type Task = Doc<"tasks">;

// タスクを一括インポート（ray-tasks → Convex）
export const importTasks = action({
  args: {
    tasks: v.array(
      v.object({
        title: v.string(),
        assignee: v.union(v.literal("ray"), v.literal("claude"), v.literal("both")),
        priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
        tag: v.optional(v.string()),
        note: v.optional(v.string()),
        status: v.optional(
          v.union(
            v.literal("todo"),
            v.literal("in_progress"),
            v.literal("waiting_ray"),
            v.literal("done")
          )
        ),
      })
    ),
  },
  returns: v.object({
    imported: v.number(),
    tasks: v.array(v.object({ title: v.string(), id: v.id("tasks") })),
  }),
  handler: async (ctx, args) => {
    const results: { title: string; id: Id<"tasks"> }[] = [];
    for (const task of args.tasks) {
      const id = await ctx.runMutation(internal.sync.createTaskInternal, {
        title: task.title,
        assignee: task.assignee,
        priority: task.priority,
        tag: task.tag,
        note: task.note,
        status: task.status || "todo",
      });
      results.push({ title: task.title, id });
    }
    return { imported: results.length, tasks: results };
  },
});

export const createTaskInternal = internalMutation({
  args: {
    title: v.string(),
    assignee: v.union(v.literal("ray"), v.literal("claude"), v.literal("both")),
    priority: v.union(v.literal("high"), v.literal("mid"), v.literal("low")),
    tag: v.optional(v.string()),
    note: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("waiting_ray"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

// エクスポート用：全タスク取得
export const getAllTasksForExport = internalQuery({
  args: {},
  handler: async (ctx): Promise<Task[]> => {
    return await ctx.db.query("tasks").collect();
  },
});

// エクスポート用：Markdown形式で出力
export const exportToMarkdown = action({
  args: {},
  returns: v.object({
    scheduled: v.string(),
    completed: v.string(),
    stats: v.object({
      todo: v.number(),
      inProgress: v.number(),
      waitingRay: v.number(),
      done: v.number(),
      total: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const tasks: Task[] = await ctx.runQuery(internal.sync.getAllTasksForExport);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0];

    // ステータス別に分類
    const todo = tasks.filter((t: Task) => t.status === "todo");
    const inProgress = tasks.filter((t: Task) => t.status === "in_progress");
    const waitingRay = tasks.filter((t: Task) => t.status === "waiting_ray");
    const done = tasks.filter((t: Task) => t.status === "done");

    const formatTask = (t: Task): string => {
      const assigneeIcon = t.assignee === "claude" ? "@Claude" : t.assignee === "both" ? "@Both" : "@Ray";
      const tag = t.tag ? ` #${t.tag}` : "";
      const priority = t.priority === "high" ? " 🔴" : t.priority === "mid" ? " 🟡" : "";
      return `- [ ] ${t.title}${tag} ${assigneeIcon}${priority}`;
    };

    const formatDoneTask = (t: Task): string => {
      const tag = t.tag ? ` #${t.tag}` : "";
      return `- [x] ${t.title}${tag}`;
    };

    // scheduled.md 形式
    const scheduledMd: string = `# Scheduled - 期限付きタスク

> 最終エクスポート: ${dateStr} ${timeStr}

---

## 作業中 (In Progress)

${inProgress.length > 0 ? inProgress.map(formatTask).join("\n") : "- （なし）"}

---

## Ray確認待ち

${waitingRay.length > 0 ? waitingRay.map(formatTask).join("\n") : "- （なし）"}

---

## Todo

${todo.length > 0 ? todo.map(formatTask).join("\n") : "- （なし）"}
`;

    // completed.md 形式
    const completedMd: string = `# Completed - 完了タスク

> 最終エクスポート: ${dateStr} ${timeStr}

---

## 完了済み

${done.length > 0 ? done.map(formatDoneTask).join("\n") : "- （なし）"}
`;

    return {
      scheduled: scheduledMd,
      completed: completedMd,
      stats: {
        todo: todo.length,
        inProgress: inProgress.length,
        waitingRay: waitingRay.length,
        done: done.length,
        total: tasks.length,
      },
    };
  },
});
