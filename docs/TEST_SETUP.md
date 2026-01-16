# テストセットアップガイド

## 前提条件

1. Node.js 18以上がインストールされていること
2. Supabaseプロジェクトが作成されていること
3. 環境変数が設定されていること

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Playwrightのインストール

```bash
npx playwright install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### 4. Supabaseデータベースのセットアップ

SupabaseプロジェクトのSQL Editorで以下のSQLを実行してください：

```sql
-- orders テーブルの作成
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

-- print_jobs テーブルの作成
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

-- インデックスの作成
create index idx_print_jobs_status on print_jobs(status);

-- Realtimeの有効化（print_jobsテーブル）
alter publication supabase_realtime add table print_jobs;
```

### 5. テストの実行

#### すべてのテストを実行

```bash
npm run test:e2e
```

#### UI付きでテストを実行（推奨）

```bash
npm run test:e2e:ui
```

#### ヘッド付きでテストを実行

```bash
npm run test:e2e:headed
```

## テストカバレッジ

### 正常系テスト

- [x] 注文UI: 有効なテーブル名でアクセス → メニューが表示される
- [x] 注文UI: メニューアイテムを選択して数量を指定 → 注文ボタンが有効になる
- [x] 注文UI: 注文送信 → 成功メッセージが表示される
- [x] 注文UI: 複数アイテムを選択して注文 → すべてのアイテムが送信される
- [x] 注文UI: 数量を変更して注文 → 正しい数量で送信される
- [x] API: 有効なリクエスト → 200 OK
- [x] API: orders テーブルに正しくINSERTされる
- [x] API: print_jobs テーブルに正しくINSERTされる
- [x] API: printable_text が正しく生成される

### 異常系テスト

- [x] 注文UI: 無効なテーブル名（空文字） → エラーメッセージ表示
- [x] 注文UI: 無効なテーブル名（特殊文字） → エラーメッセージ表示
- [x] 注文UI: メニューが空 → エラーメッセージ表示
- [x] 注文UI: アイテム未選択で注文ボタンクリック → エラーメッセージ表示
- [x] 注文UI: 数量0で注文 → エラーメッセージ表示
- [x] 注文UI: 数量101で注文 → エラーメッセージ表示
- [x] 注文UI: ネットワークエラー時 → エラーメッセージ表示
- [x] API: table が空 → 400 Bad Request
- [x] API: table が英数字以外 → 400 Bad Request
- [x] API: table が11文字以上 → 400 Bad Request
- [x] API: items が空配列 → 400 Bad Request
- [x] API: items[].name が空 → 400 Bad Request
- [x] API: items[].name が101文字以上 → 400 Bad Request
- [x] API: items[].qty が0 → 400 Bad Request
- [x] API: items[].qty が101 → 400 Bad Request
- [x] API: items[].qty が小数 → 400 Bad Request
- [x] API: リクエストボディが不正なJSON → 400 Bad Request

## トラブルシューティング

### テストが失敗する場合

1. **Supabase接続エラー**
   - 環境変数が正しく設定されているか確認
   - Supabaseプロジェクトがアクティブか確認
   - ネットワーク接続を確認

2. **データベースエラー**
   - テーブルが正しく作成されているか確認
   - インデックスが作成されているか確認
   - Realtimeが有効になっているか確認

3. **タイムアウトエラー**
   - 開発サーバーが起動しているか確認
   - `PLAYWRIGHT_TEST_BASE_URL` が正しく設定されているか確認

### テスト環境のリセット

テストデータをクリアする場合：

```sql
-- 注意: 本番環境では実行しないでください
TRUNCATE TABLE print_jobs CASCADE;
TRUNCATE TABLE orders CASCADE;
```
