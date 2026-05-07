# Flow-Safe BGM Player — デザインアイデア

## アプローチA: "Deep Work Studio"
<response>
<text>
**Design Movement**: ミニマリスト・ダークスタジオ（録音スタジオの静謐さ）

**Core Principles**:
- 視覚的ノイズをゼロに近づける「情報の断捨離」
- Manus Black (#34322D) を基調とした落ち着きのある空間
- 操作は2ボタンのみ、UIは「存在を忘れる」ほど控えめに

**Color Philosophy**:
- 背景: #34322D（Manus Black）
- テキスト主: #FFFFFF（Manus White）
- テキスト副: #F8F8F8 / 30% opacity（Manus Gray 薄め）
- Good: zinc-700（背景に溶け込む）
- Bad（警告）: pink-600（ピンク系）
- アクセント: 細い白線のみ

**Layout Paradigm**:
- 縦1カラム、中央寄せ
- プレイヤーは画面上部60%を占める
- Good/Badボタンは画面下部に大きく固定
- タイマーは右下に極小フォントで浮かぶ

**Signature Elements**:
- プレイヤー周囲に薄いグロー（blur効果）
- ボタンはシャープな角（radius最小）
- フォント: DM Sans（Manus公式）

**Interaction Philosophy**:
- ボタンクリックは「ポコ」という微細なscale変化のみ
- 状態変化はfade（0.3s）

**Animation**:
- 動画切替時: 0.5sのcross-fade
- タイマー更新: 変化なし（1分ごとに静かに切替）
- フェードアウト開始時: 音量バーがゆっくり下降

**Typography System**:
- タイトル: DM Sans Bold
- 本文・ボタン: DM Sans Regular
- タイマー: DM Sans Regular / xs / muted
</text>
<probability>0.07</probability>
</response>

## アプローチB: "Analog Warmth"
<response>
<text>
**Design Movement**: ヴィンテージ・アナログ（レコードプレイヤーの温かみ）

**Core Principles**:
- Manus Blackにわずかなウォームトーンを加えた「温かい暗闇」
- セリフフォント（Libre Baskerville）でアナログ感を演出
- ノイズテクスチャで「デジタルすぎない」質感

**Color Philosophy**:
- 背景: #34322D（Manus Black、そのままウォーム）
- テキスト主: #F8F8F8（Manus Gray）
- アクセント: amber-600（ウォームゴールド）
- Good: amber-900
- Bad（警告）: pink-700（ピンク系）

**Layout Paradigm**:
- プレイヤーを「レコードジャケット」風に正方形でセンタリング
- Good/Badボタンはレコードプレイヤーのボタン風に丸く

**Signature Elements**:
- 背景にごく薄いノイズテクスチャ
- 細いゴールドのボーダーライン
- タイマーは「◯◯分経過」のアナログ表示

**Interaction Philosophy**:
- ボタンはpress時に軽いdepth（shadow縮小）
- 全体的にゆったりとしたtransition（0.5s）

**Animation**:
- 動画切替: vinyl-scratch風のflash（極短）
- ボタン: scale(0.97) on press

**Typography System**:
- 見出し: Libre Baskerville（Manus公式セリフ）
- UI: DM Sans
</text>
<probability>0.05</probability>
</response>

## アプローチC: "Invisible Interface"
<response>
<text>
**Design Movement**: ラジカル・ミニマリズム（UIが「消える」デザイン）

**Core Principles**:
- 「見えないUI」—操作に必要な瞬間だけ要素が現れる
- Manus Blackの背景に、ほぼ何も置かない
- マウスホバー時のみコントロールが浮かび上がる

**Color Philosophy**:
- 背景: #34322D（Manus Black）
- 通常時: ほぼすべての要素が opacity: 0.15
- ホバー時: opacity: 1 にfade-in
- Good: white / opacity
- Bad（警告）: pink-500（ピンク系）

**Layout Paradigm**:
- プレイヤーは全画面背景として配置（ぼかし + 暗転）
- Good/Badボタンは画面中央下部にゴーストボタンとして存在
- タイマーは左下に極小

**Signature Elements**:
- 全画面プレイヤー（blur + opacity 0.3）
- コントロールはホバーで出現
- 動画タイトルは1行、上部に薄く

**Interaction Philosophy**:
- 「触れるまで存在しない」UI
- キーボードショートカット対応（G=Good, B=Bad）

**Animation**:
- コントロール出現: 0.4s ease-in-out
- 動画切替: 1sのslow fade

**Typography System**:
- すべて DM Sans（Manus公式）
- サイズは極端に小さく（xs〜sm）
</text>
<probability>0.08</probability>
</response>

---

## 選択: アプローチA "Deep Work Studio" を採用

視覚的ノイズを最小化しつつ、Manusブランドカラーを忠実に使用。
DM Sansフォント、Manus Black背景、ピンク系警告色、レスポンシブ1カラムレイアウト。
「存在を忘れるUI」でフロー状態を維持する。
