import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// エクスポートAPI（GET /export）
http.route({
  path: "/export",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // 簡易認証（Authorization header）
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.SYNC_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await ctx.runAction(api.sync.exportToMarkdown);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// インポートAPI（POST /import）
http.route({
  path: "/import",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 簡易認証
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.SYNC_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    if (!body.tasks || !Array.isArray(body.tasks)) {
      return new Response("Invalid request: tasks array required", { status: 400 });
    }

    const result = await ctx.runAction(api.sync.importTasks, { tasks: body.tasks });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// ヘルスチェック
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
