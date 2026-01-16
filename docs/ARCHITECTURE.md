# 開発ドキュメント（確定版）

## 飲み放題QR注文 → 自動印刷
**1店舗PoC / Vercel + Supabase / SII MP-B20**

---

## 0. ゴール

- 客がQRから飲み放題メニューを注文
- 客は **キャリア回線（5G）** のまま
- 注文が即時に **SII MP-B20** で自動印刷
- 決済なし、POS連携なし
- まずは1店舗のみ

---

## 1. 技術スタック（確定）

### サーバ
- **Vercel**
- **Next.js (App Router)**
  - 注文UI + API Route（軽量）

### DB / Queue
- **Supabase**
  - Postgres
  - Realtime（`print_jobs` の INSERT / UPDATE を購読）

### 店内
- **Gateway（CLI常駐）**
  - Windows / Linux
  - Supabase Realtime Subscribe
  - Bluetoothで SII MP-B20 に印刷

---

## 2. 非ゴール（明示的にやらない）

- 管理画面（最初は `menu.json` 直編集）
- 多店舗
- 決済
- 画像・QR印刷
- 冗長化・スケール設計

---

## 3. 全体アーキテクチャ

```
[客スマホ]
   ↓ HTTPS
[Vercel / Next.js]
   ↓ INSERT
[Supabase Postgres]
   ↓ Realtime
[Gateway CLI]
   ↓ Bluetooth
[SII MP-B20]
```

---

## 4. リポジトリ構成（モノレポ）

```
repo/
├─ apps/
│  ├─ web/        # 注文UI（QRからアクセス）
│  ├─ api/        # Vercel API Routes
│  └─ gateway/    # 店内CLI（印刷）
├─ packages/
│  └─ shared/     # 型・印刷フォーマット
├─ docs/
│  ├─ DEV_RULES.md
│  └─ adr/
├─ Makefile
└─ .env.example
```

---

## 5. Supabase スキーマ（DDL）

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

create table print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  printable_text text not null,
  status text not null default 'queued',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_print_jobs_status on print_jobs(status);
```

### status 定義

```
queued → printed
       → failed → queued（attempts < 5）
       → dead   （attempts >= 5）
```

---

## 6. Realtime 設計（重要）

Gateway は Supabase Realtime で `print_jobs` を subscribe

**対象イベント：**
- `INSERT where status = 'queued'`

👉 **ポーリングは禁止**（コストと遅延の原因）

---

## 7. Vercel（Next.js）実装

### 7.1 注文UI（apps/web）

- `/t/[table]`
- `menu.json` を読み込んで表示
- 注文送信 → `/api/orders`

### 7.2 API Route：POST /api/orders

**リクエスト例：**
```json
{
  "table": "A1",
  "items": [
    { "name": "生ビール", "qty": 1 },
    { "name": "ハイボール", "qty": 2 }
  ]
}
```

**処理：**
1. `orders` INSERT
2. `printable_text` を生成
3. `print_jobs` INSERT（`status='queued'`）

※ ロジックは軽量に保つ（10ms〜）

---

## 8. 印刷フォーマット（58mm / テキスト）

```
[飲み放題注文]
卓: A1
時刻: 2026-01-09 19:32

- 生ビール x1
- ハイボール x2
```

---

## 9. Gateway（CLI）仕様

### 9.1 コマンド

- `gateway init`        # 設定生成（Supabase URL / KEY / Printer MAC）
- `gateway test-print`  # テスト印刷
- `gateway run`         # 常駐
- `gateway status`      # 接続状態

### 9.2 動作フロー

1. Supabase Realtime subscribe
2. INSERTイベント受信
3. Bluetooth接続確認
4. ESC/POS形式で印刷
5. 成功 → `status=printed`
6. 失敗 → `attempts++`, `failed/dead`

---

## 10. MP-B20 印刷ルール

- **接続：** Bluetooth（常時ペアリング）
- **印刷：** ESC/POS（テキストのみ）

**注意：**
- 再接続ループ必須
- 印刷成功 = 書き込み成功（紙検知は期待しない）

---

## 11. エラーコード（固定）

- `BT_DISCONNECTED`
- `PRINTER_NOT_FOUND`
- `PRINT_TIMEOUT`
- `PRINT_FAILED`
- `UNKNOWN`

---

## 12. ログ仕様（必須）

**stdout / 1行JSON**

```json
{
  "level": "error",
  "job_id": "uuid",
  "error_code": "BT_DISCONNECTED",
  "message": "printer disconnected"
}
```

---

## 13. DEV_RULES（要点）

1. 1コミット = 1目的
2. Realtimeを主線にする
3. IOは必ず timeout + retry
4. 印刷系は必ずログを残す

---

## 14. Cursor 実装順（推奨）

1. Supabase DDL
2. `/api/orders`
3. `printable_text` 生成
4. Realtime subscribe（ダミー受信）
5. Gateway CLI 骨格
6. MP-B20 Bluetooth 印刷
7. retry / dead 処理

---

## 15. Cursor に最初に投げるプロンプト（コピペ）

```
このドキュメントに従って実装してください。
最初は Supabase の DDL と、
Next.js API Route（POST /api/orders）を実装してください。
print_jobs は Realtime 前提です。
```

---

## 忖度なしの最終コメント

この構成は：

- 最小コスト
- 最小工数
- 将来SaaS化可能
- 現場で紙が出る確率が高い

というバランス点にあります。

**Cursorで一気に作る → 壊れたところを Claude Code CLI で潰す、この流れが最短で正解です。**

次に必要なら

- Gateway の Bluetooth 実装ひな形
- Supabase Realtime の具体コード
- MP-B20 特有の事故パターン対策

を出せます。
