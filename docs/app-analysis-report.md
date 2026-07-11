# Type & Slash アプリ解析レポート(問題箇所と修正提案)

解析日: 2026-07-11
対象: `main` 相当 (`bd756d0 オープニング名前入力対応`)
方法: 全ソース(約7,300行)の静的レビュー + ESLint (`npx eslint .` → 39 errors / 1 warning) + `public/` 実ファイル・Firestoreルールとの突き合わせ

---

## サマリー

| 区分 | 件数 | 代表例 |
|---|---|---|
| 致命的(機能不全・データ消失) | 8 | マルチ対戦の単語リストが全て `undefined`、トレード成立結果が自動保存で消滅 |
| 高(チート・クラッシュ) | 4 | 観戦者が対戦に介入可能、バフ薬でSTR+15000 |
| 中(不具合・整合性) | 約20 | 装備複製、ガチャ/ショップ連打で二重取得、メール既読処理が存在しない |
| 低(デッドコード・品質) | 約15 | 未使用画面2枚、ItemIcon二重実装、未定義Tailwindクラス |

---

## A. 致命的 — ゲームが成立しない/データが消える

### A-1. `WORD_LISTS` が全難易度 `undefined` → マルチ対戦・アリーナが進行不能
- 箇所: `src/constants/data.jsx:178-182`、利用側 `src/components/screens/MultiplayerBattleScreen.jsx:167`、`src/components/screens/LobbyScreen.jsx:36-42`
- 内容: `WORD_LISTS.EASY = DIFFICULTY_SETTINGS.EASY.zones[0].zako` だが、zones 定義に `zako` プロパティは存在しない。EASY/NORMAL/HARD すべて `undefined`。
- 影響: マルチ対戦画面では `wordList` が undefined のため `changeWord()` が早期 return し、`currentWord` が null のまま全キー入力が無視される。**マルチ対戦・アリーナは現状一切プレイできない**。ロビーの練習表示も常にフォールバック `"Ready"` 固定。
- 修正案: シングル戦と同じくスプレッドシート由来の `floorWords` を `useGameData` から Lobby/MultiplayerBattle に props で渡す。`WORD_LISTS` は削除するか、`floorWords[difficulty]["1"]` 等へのエイリアスに置き換える。

### A-2. アイテム生成の職業ID大文字/小文字不一致 → 武器のステータスが0・装備不可
- 箇所: `src/utils/gameLogic.js:92-124`(`JOBS[..].id` は `'fighter'` 等の小文字)、呼び出し側 `src/Game.jsx:218` / `src/hooks/useGameState.js:166`(`player.job` は `'FIGHTER'` 等の大文字キー)、判定側 `src/components/screens/town/InventoryView.jsx:286` / `town/ShopView.jsx:83`(`item.jobReq.includes(player.job)`)
- 影響(双方向に破綻):
  1. 宝箱(`openTreasureChest`)で `player.job`(大文字)を渡すと `targetJob === 'fighter'` に一致せず、武器が「古びた武器」名・ATK/DEF/WT 全て0で生成される。
  2. ランダム生成品は `jobReq: ['fighter']`(小文字)なので `canEquip` が常に false になり、**初期武器以外の武器・頭防具を一度も装備できない**。
- 修正案: 職業識別子を大文字キー(`'FIGHTER'`)に統一する。`generateItem` 内の比較・`jobReq` 格納・`JOBS[..].id` の利用箇所をすべてキー基準に揃え、既存セーブデータ読み込み時に `jobReq.map(j => j.toUpperCase())` のマイグレーションを入れる。

### A-3. 初期武器が「武器とは限らない」
- 箇所: `src/hooks/useGameState.js:166-175`
- 内容: `generateItem(1, formData.job)` は 30% で消耗品、それ以外も type がランダム(防具の可能性あり)。それを名前だけ「初心者の剣」に書き換えて WEAPON スロットに装備している。
- 影響: 実体がポーションや鎧の「初心者の剣」を装備した状態で開始する(A-2 により WEAPON 型でも ATK 0)。
- 修正案: `generateItem(1, formData.job, null, true)` で装備強制にした上で、type を WEAPON に固定する専用生成(例: `generateItem(1, job, 'N', true, 'WEAPON')` のような type 指定引数を追加)にする。

### A-4. バフ薬が「効果値」でなく「持続時間(ms)」をステータスに加算
- 箇所: `src/components/screens/BattleScreen.jsx:321`(`buffs[stat] = data.effect.duration` を保存)、`src/utils/gameLogic.js:250-255`(`s.str += buffs.str`)
- 影響: 鬼人薬使用で STR が約 +15000(全敵ワンパン)、硬化薬で maxHp +30000。`effect.value: 10` は未使用。
- 修正案: バフは `{ value, expiresAt }` の形で保持し、`calculateEffectiveStats` には `value` のみ渡す。残り時間は `expiresAt - now` で表示・失効判定する。

### A-5. トレード成立結果が売り手の自動保存で消滅
- 箇所: `src/components/screens/town/TradeView.jsx:142-181`、`src/Game.jsx:91-93`(自動保存)
- 内容: 取引成立トランザクションが売り手の `saveData/current` を直接書き換えるが、売り手クライアントはローカル state を丸ごと `setDoc` 上書きする自動保存を持つ。
- 影響: 売り手がオンライン中に取引が成立すると、次の操作の自動保存で**受け取ったゴールドとアイテムが消え、出品アイテムだけ失う**。
- 修正案: 相手の saveData を直接書かず、`gifts` と同様の「受け取りボックス」ドキュメントに成立結果を積み、売り手クライアントが onSnapshot で検知してローカル state に取り込んでから保存する方式に変更。

### A-6. トレードで買い手の提供アイテムを未検証 → 偽造・複製が可能
- 箇所: `src/components/screens/town/TradeView.jsx:162-164`
- 内容: クライアントが送る `offerItem` オブジェクトを、買い手インベントリに実在するか検証せずそのまま売り手へ push。`filter(i => i.id !== offerItem.id)` は存在しない id では no-op。
- 影響: 改造クライアントで任意の LR アイテムを捏造して渡せる。正規クライアントでも Firestore 側 inventory が未保存なら複製が成立。
- 修正案: トランザクション内で買い手の saveData を読み、`offerItem.id` が inventory に存在すること・希望条件(名前/レアリティ)を満たすことを検証してから移動する。将来的には Cloud Functions 化を推奨。

### A-7. 装備中・ロック中アイテムを出品/プレゼント可能 → 複製
- 箇所: `src/components/screens/town/TradeView.jsx:201-203, 78`、`src/components/screens/town/FriendView.jsx:173-197, 217`
- 内容: 出品/贈答候補リストが `equipped`・`locked` を除外せず、削除は `setInventory`(ローカル)のみ。FriendView は `addDoc` の**前**にローカル削除し失敗時ロールバックなし。
- 影響: 装備中の武器を出品/送付すると装備スロットには残ったまま相手にも渡る(複製)。逆に送信失敗時はアイテムが消滅。
- 修正案: 候補リストから装備中(`Object.values(equipped).some(e => e?.id === item.id)`)とロック中を除外。送付は `addDoc` 成功後にローカル削除する順序に変更。

### A-8. ストーリーCSV取得失敗で新規ユーザーが真っ白画面
- 箇所: `src/hooks/useGameData.js:76-102`(try/catch の**外**で fetch)、`src/Game.jsx:316`(`openingStory.length > 0` のときのみ描画)
- 影響: ストーリー取得が失敗すると unhandled rejection が発生し、新規登録ユーザーは `STORY` state で何も描画されず操作不能。また、いずれかの CSV 取得が失敗すると `dataLoaded` が永遠に false で「データ読み込み中…」から進めない(エラー表示・リトライなし)。
- 修正案: ストーリー取得を try 内に移動。`openingStory` が空なら STORY をスキップして `CHAR_CREATE` へフォールバック。読み込み失敗時はエラー表示+再試行ボタンを出す。

---

## B. 高 — チート・クラッシュ・セキュリティ

### B-1. 観戦者が対戦に介入できる/クラッシュする
- 箇所: `src/components/screens/MultiplayerBattleScreen.jsx:212-233, 338-366, 388-389, 470`
- 内容: ① `playerRole === 'SPECTATOR'` の分岐がなく、player1 でない者は全員 player2 として扱われ、観戦者のキー入力が Firestore にダメージとして書き込まれる。② `myData` の null ガードがなく、WAITING 中のルームを観戦すると `myData.hp` 参照で TypeError クラッシュ(`LobbyScreen.jsx:141-150` の `spectateRoom` は status を確認しない)。
- 修正案: SPECTATOR は入力ハンドラと書き込みを完全に無効化。`if (!roomData || !myData || !enemyData) return` のガードを追加し、spectate 時は PLAYING のルームのみ選択可にする。

### B-2. マルチ対戦の HP/ダメージが完全クライアント権威 + ルールが全開
- 箇所: `MultiplayerBattleScreen.jsx:338-341, 363-366`、`firestore.rules`(`rooms`/`trades`/`chats` は `isSignedIn()` なら誰でも read/write)
- 影響: DevTools から `updateDoc` するだけで任意のルーム・トレード・チャットを改変でき、即勝利・ランクポイント不正・他人の取引の破壊が可能。`saveData` も本人書き込み自由なのでゴールド・アイテムは自己申告(ソロゲームとしては許容範囲だが、トレード/アリーナがある以上、他プレイヤーに波及する)。
- 修正案: 最低限、rules で `rooms/{roomId}` の書き込みを「参加者(player1/player2 の uid)のみ」「hp の減算幅の上限」などフィールド単位で制限。本格対応は Cloud Functions での判定移行。

### B-3. 相打ち・切断で対戦が永遠に終わらない
- 箇所: `MultiplayerBattleScreen.jsx:369-383`
- 内容: `myData.hp > 0` 側のクライアントだけが `status:'FINISHED'` を書くため、同一スナップショットで両者 HP ≤ 0 になると誰も winner を書かない。勝者側が直後に切断しても同様。
- 修正案: `hp <= 0` を検知した側が自分の敗北として書き込む(両者が書いても transaction で先勝ち)方式に変更し、タイムアウト(例: 一定時間更新なしで不戦勝)を追加。

### B-4. ルーム参加が check-then-act で競合
- 箇所: `src/components/screens/LobbyScreen.jsx:88-132`(`getDoc`→`updateDoc`)、`src/components/screens/town/ArenaView.jsx:100-111`(事前チェックすら無し)
- 影響: 2人が同時参加すると後勝ちで player2 が上書きされ、片方は存在しない対戦に入ってハングする。
- 修正案: `runTransaction` で `status === 'WAITING'` を検証してから参加者を書き込む。

---

## C. 中 — 目に見える不具合・整合性問題

1. **リロードのたびに再ログインが必要**: `loadUserData` は `gameState === 'INIT'`(AuthScreen ログイン時のみ設定)でしか呼ばれない(`Game.jsx:84-88, 303`)。Firebase Auth はセッションを永続化しているのに、リロード後は player 未ロードのタイトルに戻る。→ `onAuthStateChanged` で user が復元されたら直接 `loadUserData` を呼ぶ。
2. **ガチャ・ショップの連打で二重取得/所持金マイナス**: `GachaView.jsx:57-70`(クリック時点の `player.gold` から絶対値で上書き、しかも 1 秒後の setTimeout 内)、`ShopView.jsx:18-27`(stale チェック + functional 減算)。→ functional update に統一し、実行中フラグでボタンを無効化。
3. **同一IDアイテムが複数あると売却で全部消える**: `InventoryView.jsx:121` 等の `filter(i => i.id !== item.id)`。ショップ購入は同じ商品オブジェクトを使い回すため同一 id が複数入り得る。→ 購入時に `generateId()` で新しい id を採番。
4. **戦闘ループの interval が毎キー入力で再生成**: `BattleScreen.jsx:251` の依存配列に毎レンダー新規生成の `eff.battle` が入っている。さらに毒ダメージ判定が `now % 2000 < 100`(`BattleScreen.jsx:194-197`)のため、tick 位相次第で毒が多重発生/スキップ。→ `eff` を `useMemo` 化し、毒は `lastPoisonTick` を battleState に持たせて経過時間で判定。
5. **ミスペナルティ等で state を直接ミューテーション**: `BattleScreen.jsx:224, 410-411`(`prev.statusAilments.poison = true`、`currentEnemy.currentAttackGauge = ...`)。StrictMode でペナルティが2倍になる。`Game.jsx:221-241` の `newPlayer.records` 系も同様の浅いコピー。→ スプレッドで新オブジェクトを作る。
6. **勝敗コールバックの setTimeout にクリーンアップなし**: `BattleScreen.jsx:267, 273`。発火前に「帰還」すると町遷移後に `onWin`/`onLose` が重複発火。→ effect の cleanup で `clearTimeout`。
7. **マルチ戦闘ログが `arrayUnion` で重複排除される**: `MultiplayerBattleScreen.jsx:340, 365`。同文言のログ(固定10ダメージ)は 2 回目以降追加されない。→ ログにタイムスタンプ/ID を含めるか通常の `updateDoc` + スライスに変更。
8. **ストーリーのひらがな表示が機能しない**: CSV 側キーは `JA_HIRA`(`useGameData.js:94`)、言語設定は `JA_KANA`(`data.jsx:7`、`StoryModal.jsx:41`)。→ キー名を統一。
9. **オープニングで入力した名前が破棄される**: `Game.jsx:328` は `initialName` を渡すが `CharCreateScreen.jsx:54-55` は受け取らない。名前の空文字チェックもなし。→ `initialName` を初期値に採用し、空名は登録不可に。
10. **ログイン失敗時に生エラー表示**: firebase v12 は `auth/invalid-credential` を返すが `AuthScreen.jsx:35-39` のマッピングにない。パスワード確認・6文字チェックもなし。
11. **メールの既読処理が存在しない**: `MailView.jsx:71` で `read:false` を書くのみで、`read:true` に更新するコードがリポジトリに無い。未読バッジ(`MenuSidebar`)が増える一方。
12. **フレンド承認/削除/ブロックが非アトミック**: `FriendView.jsx:48-88, 143-163`。途中失敗で片側だけフレンドの非対称状態が恒久化。→ `writeBatch` 化。
13. **アリーナの幽霊ルーム**: `ArenaView.jsx:53-98`。待機中に離脱してもルーム doc を削除しない。→ unmount 時 delete + `onDisconnect` 相当の TTL/タイムスタンプ掃除。
14. **キャラ切替で装備条件を再検証しない**: `StatusView.jsx:27-35`。ファイターの剣を持ったままメイジに切替可能(転職画面とは非一貫)。
15. **`dwarf_male_archer.png` 欠落 + onError で恒久非表示**: `public/character/`(32通り中この1枚のみ欠落)、`CharCreateScreen.jsx:99-103`(`style.display='none'` がReact管理外で復帰しない)。→ 画像追加 + `useState` でエラー管理し選択変更でリセット。
16. **`battle_normal.mp3` が存在しない**: `useAudio.js:44` が参照するが `public/sounds/` には無く、B6F 以降の戦闘BGMが無音(404)。
17. **難易度データが未完成**: `data.jsx:107-175` の zones は B15F まで・EASY/NORMAL/HARD 完全同一。`useGameData.js:23-27` の単語CSVも 3 難易度とも同一URL(同じものを3回fetch)。B16F 以降はゾーン名が常に「はじまりの草原」、`HomeView` では現在階に遷移できなくなる。
18. **ギフト購読が player 更新のたびに再購読**: `TownScreen.jsx:42-91`。受領処理中の再購読で同一ギフトの二重付与があり得る。→ 依存を `player.id` に絞り、削除完了後に inventory へ反映。
19. **トレード表示が不正 doc で全員クラッシュ**: `TradeView.jsx:195, 215, 297` が `trade.item.name` 等を null チェックなしで参照(rules 上、誰でも trades に書ける)。→ 描画前にスキーマ検証して不正 doc はスキップ。
20. **トレード希望条件が構造的に一致不能**: `TradeView.jsx:354` のドロップダウンは部位ラベル(頭/身体/…)だが実アイテム名は「上質な剣」等で、`name` 完全一致は成立しない。出品キャンセルUIも無い。→ 希望条件を type + rarity 比較に変更し、キャンセル導線を追加。

---

## D. 低 — デッドコード・品質

- **未使用ファイル/コード**: `ShopScreen.jsx`・`ClassChangeScreen.jsx`(どこからも import されない旧画面)、`constants/scenario.js`(0バイト)、`GachaView.jsx:21-55` の `handleCharGacha`(同一ロジックがインライン重複)、`ResultModal` の `scoreInfo`(渡されるが未表示)。
- **ItemIcon 二重実装**: `common/ItemIcon.jsx`(imageId 対応)と `town/ItemIcon.jsx`(imageId 無視・アイコン割当も別物)。StatusView だけ前者を使用し、画面間で同一アイテムの見た目が異なる。→ common 版に一本化。
- **ESLint 39 errors**: レンダー内コンポーネント定義(`StatusView` の `EquipSlot`、`InventoryView` の `DiffValue`、`MailView` 内 2 件 — 再マウントで状態リセット・N件の `getDoc` 再発行の実害あり)、`MultiplayerBattleScreen.jsx:201` の TDZ 手前参照、未使用変数多数。
- **未定義 Tailwind クラス**: `animate-shake`/`animate-fade-in`/`animate-slide-up`/`image-pixelated` 等が config/CSS に定義されておらず、ストーリーの `EFFECT_SHAKE` 演出などが無効。
- **細部**: レベルアップが1クリア1回のみ(経験値が2レベル分でも1つしか上がらない)、`calcInitialStats` が加算後 5〜10 にクランプするため職業/種族補正がほぼ無効、宝箱画面で離脱すると報酬(ゴールド・経験値含む)が全て消える、初期ポーションの `value` がランダム抽選品の価格のまま、アリーナ進捗バーの計算違い(`ArenaView.jsx:132`)、`createdAt` 未確定時の NaN ソート(`ArenaView.jsx:45`)、ルームID衝突時の無言上書き(`LobbyScreen.jsx:32`)、トレード価格に小数・巨大数の検証なし、`.firebase/` キャッシュのコミット(要 .gitignore 追加)、`index.html` の `lang="en"`、自動保存が state 変更のたびに全ドキュメント書き込み(書き込み課金増)。

---

## 修正の推奨順序

1. **A-1〜A-4**(データ定義・生成ロジックの修正。少量のコード変更でゲームの根幹が直る)
2. **A-5〜A-7 + B 系**(トレード/マルチのデータ設計と Firestore ルール。設計変更を伴う)
3. **C 系**(個別バグ。それぞれ独立に修正可能)
4. **D 系**(クリーンアップ。ESLint を CI に入れると再発防止になる)
