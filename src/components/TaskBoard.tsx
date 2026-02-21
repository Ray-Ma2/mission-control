"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Status = "todo" | "in_progress" | "waiting_ray" | "done";
type Assignee = "ray" | "claude" | "both";
type Priority = "high" | "mid" | "low";

interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  status: Status;
  assignee: Assignee;
  priority: Priority;
  tag?: string;
  note?: string;
}

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "Todo", color: "text-dim" },
  { id: "in_progress", label: "In Progress", color: "amber" },
  { id: "waiting_ray", label: "Ray確認待ち", color: "red" },
  { id: "done", label: "Done", color: "green" },
];

const PRIORITY_COLORS = {
  high: "border-l-red",
  mid: "border-l-amber",
  low: "border-l-text-muted",
};

const ASSIGNEE_LABELS = {
  ray: { label: "Ray", color: "purple", icon: "👤" },
  claude: { label: "Claude", color: "cyan", icon: "🤖" },
  both: { label: "Both", color: "green", icon: "🤝" },
};

export function TaskBoard() {
  const tasks = useQuery(api.tasks.list);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [showAddModal, setShowAddModal] = useState(false);

  const groupedTasks = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks?.filter((t) => t.status === col.id) || [];
      return acc;
    },
    {} as Record<Status, Task[]>
  );

  const handleStatusChange = async (
    taskId: Id<"tasks">,
    newStatus: Status,
    author: "ray" | "claude" = "ray"
  ) => {
    await updateStatus({ id: taskId, status: newStatus, author });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm text-cyan tracking-[4px] uppercase [text-shadow:0_0_10px_var(--cyan)]">
            Task Board
          </h2>
          <p className="text-[10px] text-text-muted mt-1">
            タスクの進捗を管理する
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-cyan/10 border border-cyan/40 text-cyan text-[11px] tracking-wider rounded hover:bg-cyan/20 transition-colors"
        >
          + タスク追加
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            tasks={groupedTasks[col.id]}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function Column({
  column,
  tasks,
  onStatusChange,
}: {
  column: { id: Status; label: string; color: string };
  tasks: Task[];
  onStatusChange: (id: Id<"tasks">, status: Status) => void;
}) {
  const colorClasses = {
    "text-dim": "text-text-dim",
    amber: "text-amber",
    red: "text-red",
    green: "text-green",
  };

  return (
    <div className="bg-panel/90 border border-border-glow rounded backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span
          className={`text-[10px] tracking-[3px] uppercase ${colorClasses[column.color as keyof typeof colorClasses]}`}
        >
          {column.label}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] bg-${column.color}/10 border border-${column.color}/40 ${colorClasses[column.color as keyof typeof colorClasses]}`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="p-3 space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-text-muted text-[11px] py-8">—</div>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: Id<"tasks">, status: Status) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const assignee = ASSIGNEE_LABELS[task.assignee];

  return (
    <div
      className={`bg-[#0a1520cc] border border-border rounded-sm p-3 border-l-2 ${PRIORITY_COLORS[task.priority]} relative group`}
    >
      <div className="text-[13px] mb-2 text-text">{task.title}</div>

      <div className="flex gap-1.5 items-center flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-sm text-[10px] tracking-wider bg-${assignee.color}/10 border border-${assignee.color}/40 text-${assignee.color}`}
        >
          {assignee.icon} {assignee.label}
        </span>
        {task.tag && (
          <span className="px-2 py-0.5 rounded-sm text-[10px] bg-text-muted/10 border border-text-muted/40 text-text-dim">
            {task.tag}
          </span>
        )}
      </div>

      {/* Status change dropdown */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-text text-xs transition-opacity"
      >
        ⋯
      </button>

      {showMenu && (
        <div className="absolute top-8 right-2 bg-panel border border-border-glow rounded shadow-lg z-10">
          {COLUMNS.filter((col) => col.id !== task.status).map((col) => (
            <button
              key={col.id}
              onClick={() => {
                onStatusChange(task._id, col.id);
                setShowMenu(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-text-dim hover:bg-border/30 hover:text-text"
            >
              → {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("ray");
  const [priority, setPriority] = useState<Priority>("mid");
  const [tag, setTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      assignee,
      priority,
      tag: tag.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-panel border border-border-glow rounded-lg w-[400px] shadow-[0_0_30px_rgba(0,212,255,0.1)]">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-[11px] tracking-[3px] uppercase text-cyan">
            新規タスク
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] text-text-dim mb-1 tracking-wider">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-cyan"
              placeholder="タスクのタイトル"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-text-dim mb-1 tracking-wider">
                担当者
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as Assignee)}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-cyan"
              >
                <option value="ray">👤 Ray</option>
                <option value="claude">🤖 Claude</option>
                <option value="both">🤝 Both</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-text-dim mb-1 tracking-wider">
                優先度
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-cyan"
              >
                <option value="high">🔴 High</option>
                <option value="mid">🟡 Mid</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-text-dim mb-1 tracking-wider">
              タグ（任意）
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-[13px] text-text outline-none focus:border-cyan"
              placeholder="例: SEO, Client, Dev"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-border text-text-dim text-[11px] rounded hover:bg-border/30"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-cyan/20 border border-cyan/40 text-cyan text-[11px] rounded hover:bg-cyan/30"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
