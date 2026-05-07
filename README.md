# Flow-Safe BGM Player

仕事集中用 YouTube BGM プレイヤー。Good/Bad 評価によるパーソナライズ、煽りワード自動フィルタリング、アンチ・ポモドーロのタイマー機能を備えたローカル完結型 Web アプリです。

## 特徴

- **Good/Bad 評価**: チャンネル単位でお気に入り・ブロックを管理。評価はブラウザの `localStorage` に保存され、次回以降に反映されます。
- **煽りワードフィルタリング**: 「【速報】」「ヤバい」「炎上」などのタイトルを自動除外します。
- **アンチ・ポモドーロ タイマー**: カウントダウンではなく「◯分経過」のパッシブ表示。60分でソフト時報（Web Audio API）、120分で5分かけてフェードアウト。
- **映像ぼかし**: 動画映像が気になる場合はワンクリックでぼかせます。
- **設定の持ち運び**: Good/Bad データを JSON でエクスポート・インポートできます。

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/masakiishitani/flow-safe-bgm-player.git
cd flow-safe-bgm-player
```

### 2. 依存パッケージをインストール

```bash
pnpm install
# または
npm install
```

### 3. YouTube Data API v3 のキーを設定

[Google Cloud Console](https://console.cloud.google.com/) で YouTube Data API v3 を有効化し、API キーを発行してください。

プロジェクトルートに `.env` ファイルを作成し、以下を記述します。

```
VITE_YOUTUBE_API_KEY=AIzaSy...（あなたのAPIキー）
```

### 4. 開発サーバーを起動

```bash
pnpm dev
# または
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 使い方

1. キーワード（例: `lofi hip hop`, `作業用BGM`, `jazz study`）を入力して「再生開始」をクリック
2. BGM が自動的に再生されます
3. 動画が気に入ったら **Good**（チャンネルをお気に入りに追加）、不要なら **Bad**（チャンネルをブロックして次の動画へ）
4. 右上の設定アイコンから音量調整・データのエクスポート/インポートができます

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
- **ストレージ**: `localStorage`（サーバー不要）
- **フォント**: DM Sans（Manus 公式フォント）

## ライセンス

MIT
