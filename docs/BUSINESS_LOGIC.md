# ビジネスロジック仕様書

## 1. 注文フロー

### 1.1 正常系フロー

1. **顧客がQRコードをスキャン**
   - URL形式: `/t/[table]` (例: `/t/A1`)
   - テーブル名は英数字1-10文字（大文字小文字区別）

2. **メニュー表示**
   - `menu.json` からメニューアイテムを読み込み
   - 各アイテムには `name` (必須), `price` (表示用、実際は0円), `category` (オプション) が含まれる
   - メニューが空の場合はエラーメッセージを表示

3. **注文送信**
   - 顧客がアイテムを選択し数量を指定
   - 数量は1以上100以下（整数のみ）
   - 注文ボタンクリック → `POST /api/orders`

4. **注文処理（API）**
   - リクエストバリデーション
     - `table`: 必須、英数字1-10文字
     - `items`: 必須、配列、1件以上
     - `items[].name`: 必須、文字列1-100文字
     - `items[].qty`: 必須、整数1-100
   - `orders` テーブルにINSERT
   - `printable_text` を生成（フォーマット後述）
   - `print_jobs` テーブルにINSERT（`status='queued'`）
   - レスポンス: `{ success: true, order_id: "uuid" }`

5. **印刷ジョブ処理（Gateway）**
   - Realtimeで `print_jobs` の INSERT を検知（`status='queued'` のみ）
   - Bluetooth接続確認
   - ESC/POS形式で印刷実行
   - 成功: `status='printed'`, `updated_at` 更新
   - 失敗: `status='failed'`, `attempts++`, `last_error` 設定

### 1.2 異常系フロー

#### 1.2.1 注文UI異常系

- **無効なテーブル名**
  - テーブル名が空、または英数字以外を含む
  - エラー: "無効なテーブル名です"

- **メニュー読み込み失敗**
  - `menu.json` が存在しない、またはJSON形式が不正
  - エラー: "メニューを読み込めませんでした"

- **注文アイテムなし**
  - 数量0または未選択の状態で注文ボタンクリック
  - エラー: "注文するアイテムを選択してください"

- **数量超過**
  - 1アイテムあたり100を超える数量
  - エラー: "数量は1〜100の範囲で指定してください"

#### 1.2.2 API異常系

- **リクエストバリデーションエラー**
  - `table` が空、または形式不正
  - `items` が空配列、または形式不正
  - `items[].name` が空、または100文字超過
  - `items[].qty` が1未満、または100超過、または非整数
  - レスポンス: `{ success: false, error: "バリデーションエラー詳細" }`, ステータス400

- **データベース接続エラー**
  - Supabase接続失敗
  - レスポンス: `{ success: false, error: "データベースエラー" }`, ステータス500

- **タイムアウト**
  - API処理が10秒を超える
  - レスポンス: `{ success: false, error: "タイムアウト" }`, ステータス504

#### 1.2.3 印刷ジョブ異常系

- **Bluetooth接続失敗**
  - プリンターが見つからない
  - エラーコード: `PRINTER_NOT_FOUND`
  - `status='failed'`, `attempts++`, `last_error` 設定

- **Bluetooth切断**
  - 印刷中に接続が切断
  - エラーコード: `BT_DISCONNECTED`
  - `status='failed'`, `attempts++`, `last_error` 設定

- **印刷タイムアウト**
  - 印刷処理が30秒を超える
  - エラーコード: `PRINT_TIMEOUT`
  - `status='failed'`, `attempts++`, `last_error` 設定

- **印刷失敗**
  - ESC/POSコマンド送信失敗
  - エラーコード: `PRINT_FAILED`
  - `status='failed'`, `attempts++`, `last_error` 設定

- **リトライ処理**
  - `attempts < 5`: `status='failed'` → `status='queued'` に戻す（次回再処理）
  - `attempts >= 5`: `status='dead'` に設定（再処理しない）

## 2. データモデル

### 2.1 orders テーブル

```typescript
interface Order {
  id: string;              // UUID, 自動生成
  table_name: string;      // テーブル名（英数字1-10文字）
  items: OrderItem[];      // JSONB形式
  created_at: string;     // ISO8601形式
}

interface OrderItem {
  name: string;            // アイテム名（1-100文字）
  qty: number;             // 数量（1-100）
}
```

### 2.2 print_jobs テーブル

```typescript
interface PrintJob {
  id: string;              // UUID, 自動生成
  order_id: string;       // orders.id への外部キー
  printable_text: string; // 印刷テキスト（必須）
  status: 'queued' | 'printed' | 'failed' | 'dead';
  attempts: number;        // リトライ回数（0から開始）
  last_error: string | null; // エラーメッセージ
  created_at: string;     // ISO8601形式
  updated_at: string;     // ISO8601形式
}
```

### 2.3 status遷移図

```
queued → printed (成功)
      → failed → queued (attempts < 5, 再処理)
              → dead (attempts >= 5, 処理終了)
```

## 3. 印刷フォーマット仕様

### 3.1 フォーマット定義

```
[飲み放題注文]
卓: {table_name}
時刻: {YYYY-MM-DD HH:mm}

{items.map(item => `- ${item.name} x${item.qty}`).join('\n')}
```

### 3.2 例

```
[飲み放題注文]
卓: A1
時刻: 2026-01-09 19:32

- 生ビール x1
- ハイボール x2
- ウーロン茶 x1
```

### 3.3 ESC/POS変換ルール

- 文字コード: UTF-8
- 改行: LF (`\n`)
- 文字サイズ: 標準（ESC/POSデフォルト）
- 切れ目: 3行分の空白 + カットコマンド（可能な場合）

## 4. バリデーションルール

### 4.1 テーブル名

- 必須: はい
- 形式: 英数字のみ
- 長さ: 1-10文字
- 大文字小文字: 区別する

### 4.2 注文アイテム

- 必須: はい（1件以上）
- 各アイテム:
  - `name`: 必須、文字列、1-100文字
  - `qty`: 必須、整数、1-100

### 4.3 メニューアイテム

- `name`: 必須、文字列、1-100文字
- `price`: オプション、数値（表示用）
- `category`: オプション、文字列

## 5. エラーハンドリング

### 5.1 エラーコード定義

| コード | 説明 | 発生箇所 |
|--------|------|----------|
| `BT_DISCONNECTED` | Bluetooth接続が切断された | Gateway |
| `PRINTER_NOT_FOUND` | プリンターが見つからない | Gateway |
| `PRINT_TIMEOUT` | 印刷がタイムアウトした | Gateway |
| `PRINT_FAILED` | 印刷が失敗した | Gateway |
| `UNKNOWN` | 不明なエラー | 全般 |

### 5.2 ログ形式

```json
{
  "level": "error|info|warn|debug",
  "job_id": "uuid",
  "order_id": "uuid",
  "error_code": "BT_DISCONNECTED",
  "message": "printer disconnected",
  "timestamp": "2026-01-09T19:32:00Z"
}
```

## 6. パフォーマンス要件

- API処理時間: 10ms〜（軽量に保つ）
- 印刷ジョブ検知: Realtime即時（ポーリング禁止）
- 印刷タイムアウト: 30秒
- APIタイムアウト: 10秒

## 7. セキュリティ要件

- HTTPS必須（Vercel自動）
- CORS設定: 必要に応じて設定
- 入力サニタイズ: XSS対策
- SQLインジェクション対策: Supabaseクライアント使用（パラメータ化クエリ）
