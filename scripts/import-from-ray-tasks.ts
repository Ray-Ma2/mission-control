/**
 * ray-tasks → Convex インポートスクリプト
 *
 * 使い方:
 * npx tsx scripts/import-from-ray-tasks.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ray-tasksから抽出したタスク
const tasksToImport = [
  // inbox
  {
    title: "SEO対策のKWチェック",
    assignee: "ray" as const,
    priority: "mid" as const,
    tag: "kobe-tenku",
  },
  {
    title: "今月分の記事作成（2記事）",
    assignee: "ray" as const,
    priority: "mid" as const,
    tag: "kobe-tenku",
  },
  // scheduled
  {
    title: "まんてんR 定例MTG（2/27）",
    assignee: "ray" as const,
    priority: "mid" as const,
    tag: "manten-r",
    note: "2026-02-27",
  },
  {
    title: "まんてんR 定例MTG（3/6）",
    assignee: "ray" as const,
    priority: "mid" as const,
    tag: "manten-r",
    note: "2026-03-06",
  },
  // backlog
  {
    title: "事前決済割引の設定（社長承認後に導入）",
    assignee: "ray" as const,
    priority: "low" as const,
    tag: "kobe-tenku",
  },
  {
    title: "Google Calendar API連携スクリプト作成",
    assignee: "claude" as const,
    priority: "mid" as const,
    tag: "dev",
  },
  {
    title: "OpenClaw と ray-tasks の連携設定",
    assignee: "both" as const,
    priority: "mid" as const,
    tag: "dev",
  },
];

async function main() {
  console.log("Importing tasks to Convex...");
  console.log(`URL: ${process.env.NEXT_PUBLIC_CONVEX_URL}`);
  console.log(`Tasks to import: ${tasksToImport.length}`);
  console.log("");

  const result = await client.action(api.sync.importTasks, {
    tasks: tasksToImport,
  });

  console.log("Import complete!");
  console.log(result);
}

main().catch(console.error);
