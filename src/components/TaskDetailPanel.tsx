"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Status = "todo" | "in_progress" | "waiting_ray" | "done";
type Assignee = "ray" | "claude" | "both";

interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  status: Status;
  assignee: Assignee;
  priority: "high" | "mid" | "low";
  tag?: string;
  note?: string;
}

interface Log {
  _id: Id<"logs">;
  _creationTime: number;
  taskId: Id<"tasks">;
  author: "ray" | "claude";
  message: string;
}

const STATUS_LABELS = {
  todo: { label: "Todo", color: "text-dim" },
  in_progress: { label: "In Progress", color: "amber" },
  waiting_ray: { label: "Ray確認待ち", color: "red" },
  done: { label: "Done", color: "green" },
};

const ASSIGNEE_LABELS = {
  ray: { label: "Ray", color: "purple", icon: "👤" },
  claude: { label: "Claude", color: "cyan", icon: "🤖" },
  both: { label: "Both", color: "green", icon: "🤝" },
};

export function TaskDetailPanel({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const logs = useQuery(api.logs.listByTask, { taskId: task._id });
  const addLog = useMutation(api.logs.add);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await addLog({
      taskId: task._id,
      author: "ray",
      message: newMessage.trim(),
    });
    setNewMessage("");
    setIsSubmitting(false);
  };

  const handleStatusChange = async (newStatus: Status) => {
    await updateStatus({
      id: task._id,
      status: newStatus,
      author: "ray",
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const status = STATUS_LABELS[task.status];
  const assignee = ASSIGNEE_LABELS[task.assignee];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-[420px] bg-panel border-l border-border-glow shadow-[-4px_0_30px_rgba(0,212,255,0.1)] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-[15px] text-text font-medium leading-tight">
              {task.title}
            </h2>
            <div className="flex gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] tracking-wider bg-${status.color}/10 border border-${status.color}/40 text-${status.color}`}
              >
                {status.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] tracking-wider bg-${assignee.color}/10 border border-${assignee.color}/40 text-${assignee.color}`}
              >
                {assignee.icon} {assignee.label}
              </span>
              {task.tag && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-text-muted/10 border border-text-muted/40 text-text-dim">
                  {task.tag}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-lg"
          >
            ✕
          </button>
        </div>

        {/* Status change buttons */}
        <div className="px-5 py-3 border-b border-border">
          <div className="text-[10px] text-text-muted tracking-wider mb-2">
            ステータス変更
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(STATUS_LABELS) as Status[])
              .filter((s) => s !== task.status)
              .map((s) => {
                const st = STATUS_LABELS[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-2 py-1 rounded text-[10px] tracking-wider bg-${st.color}/10 border border-${st.color}/40 text-${st.color} hover:bg-${st.color}/20 transition-colors`}
                  >
                    → {st.label}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Note */}
        {task.note && (
          <div className="px-5 py-3 border-b border-border">
            <div className="text-[10px] text-text-muted tracking-wider mb-1">
              メモ
            </div>
            <div className="text-[12px] text-text-dim">{task.note}</div>
          </div>
        )}

        {/* Logs */}
        <div className="flex-1 overflow-auto px-5 py-4">
          <div className="text-[10px] text-text-muted tracking-wider mb-3">
            作業ログ
          </div>

          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log: Log) => (
                <div
                  key={log._id}
                  className="bg-[#0a1520cc] border border-border rounded p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] ${log.author === "claude" ? "text-cyan" : "text-purple"}`}
                    >
                      {log.author === "claude" ? "🤖 Claude" : "👤 Ray"}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {formatTime(log._creationTime)}
                    </span>
                  </div>
                  <div className="text-[12px] text-text-dim leading-relaxed">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-text-muted text-[11px] py-8">
              ログがありません
            </div>
          )}
        </div>

        {/* Add log form */}
        <form onSubmit={handleAddLog} className="px-5 py-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 bg-bg border border-border rounded px-3 py-2 text-[12px] text-text outline-none focus:border-cyan"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="px-3 py-2 bg-cyan/20 border border-cyan/40 text-cyan text-[11px] rounded hover:bg-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
