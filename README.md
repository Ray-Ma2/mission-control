# Mission Control

RayとClaudeが協力してタスクを進めるための共有ダッシュボード。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router)
- **データベース**: Convex (リアルタイム同期)
- **デプロイ**: Railway

## 機能

- ✅ タスクボード（4カラムカンバン）
- ✅ タスク追加・編集
- ✅ 作業ログ（タイムライン）
- ✅ ヘッダーにサマリー表示
- ✅ ray-tasksへの定期エクスポート（朝6時・夕方6時）

## ローカル開発

```bash
# 依存関係インストール
npm install

# Convex開発サーバー起動（別ターミナル）
npx convex dev

# Next.js開発サーバー起動
npm run dev
```

http://localhost:3000 でアクセス

## デプロイ

### 1. Convex本番環境

```bash
npx convex deploy
```

本番用URLが発行されます（例: `https://xxx.convex.cloud`）

### 2. Railway

1. [Railway](https://railway.app) でNew Projectを作成
2. GitHubリポジトリ `Ray-Ma2/mission-control` を接続
3. 環境変数を設定:
   - `NEXT_PUBLIC_CONVEX_URL`: Convex本番URL
4. デプロイ完了を待つ

### 環境変数

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex API URL |
| `SYNC_API_TOKEN` | ray-tasks同期用トークン（Convex側で設定） |

## ray-tasks連携

GitHub Actionsで定期的にConvexからray-tasksへエクスポート。

- **スケジュール**: 朝6時（JST）、夕方6時（JST）
- **手動実行**: GitHub Actions → Run workflow

## ディレクトリ構成

```
mission-control/
├── convex/           # Convex関数・スキーマ
│   ├── schema.ts     # データスキーマ
│   ├── tasks.ts      # タスクCRUD
│   ├── logs.ts       # ログ操作
│   ├── sync.ts       # インポート/エクスポート
│   └── http.ts       # HTTP Actions
├── src/
│   ├── app/          # Next.js App Router
│   └── components/   # Reactコンポーネント
└── scripts/          # ユーティリティスクリプト
```

## API

### エクスポート（GET /export）

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://xxx.convex.site/export"
```

### インポート（POST /import）

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tasks": [...]}' \
  "https://xxx.convex.site/import"
```
