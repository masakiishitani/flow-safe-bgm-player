# Flow-Safe BGM Player

仕事集中用 YouTube BGM プレイヤー。Good/Bad 評価によるパーソナライズ、煽りワード自動フィルタリング、アンチ・ポモドーロのタイマー機能を備えたローカル完結型 Web アプリです。

## セットアップ（3ステップ）

### 事前準備

- [Node.js](https://nodejs.org/) v18 以上
- pnpm（入っていない場合は `npm install -g pnpm` でインストール）
- YouTube Data API v3 のキー（[取得方法](#youtube-data-api-v3-キーの取得)を参照）

### 手順

```bash
# 1. クローン＆インストール
git clone https://github.com/masakiishitani/flow-safe-bgm-player.git
cd flow-safe-bgm-player
pnpm install

# 2. APIキーを設定（YOUR_API_KEY を自分のキーに置き換える）
echo "VITE_YOUTUBE_API_KEY=YOUR_API_KEY" > .env

# 3. 起動
pnpm dev
```

ブラウザで `http://localhost:3000` を開いたら完了です。

---

## YouTube Data API v3 キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスしてログイン
2. 新しいプロジェクトを作成（例: `flow-safe-bgm`）
3. 「APIとサービス」→「ライブラリ」→「YouTube Data API v3」を検索して「有効にする」
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」を選択
5. 表示された `AIzaSy...` で始まるキーをコピーして手順 2 の `YOUR_API_KEY` に貼り付ける

> **無料枠について**: 1日あたり最大100回程度の検索が可能です。個人利用では十分な量です。

---

## 使い方

1. キーワード（例: `lofi hip hop`, `作業用BGM`, `jazz study`）を入力して「再生開始」をクリック
2. BGM が自動再生されます
3. **Good** → チャンネルをお気に入りに追加（次回以降優先再生）
4. **Bad** → チャンネルをブロックして次の動画へスキップ
5. 右上の歯車アイコンから音量調整・データのエクスポート/インポートができます

## タイマー仕様

| タイミング | 動作 |
| :--- | :--- |
| 再生開始 | 経過時間のカウントを開始（右下に表示） |
| 60分経過 | ソフトな時報音（BGM は継続） |
| 120分経過 | 5分かけてフェードアウト → セッション終了 |

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **プレイヤー**: YouTube IFrame Player API
- **音声**: Web Audio API（時報音の生成）
- **ストレージ**: `localStorage`（サーバー不要・データはブラウザに保存）
- **フォント**: DM Sans

## ライセンス

MIT
