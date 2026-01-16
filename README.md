# 飲み放題QR注文システム

QRコードから飲み放題メニューを注文し、自動でレシートプリンターに印刷するシステムです。

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL + Realtime)
- Playwright (E2Eテスト)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Supabaseのセットアップ

Supabaseプロジェクトで以下のSQLを実行してください：

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

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## テスト

### E2Eテストの実行

```bash
npm run test:e2e
```

### UI付きでテストを実行

```bash
npm run test:e2e:ui
```

## プロジェクト構造

```
drinkQR/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── orders/        # POST /api/orders
│   ├── t/                 # テーブルページ
│   │   └── [table]/       # /t/[table]
│   └── layout.tsx
├── e2e/                   # Playwright E2Eテスト
│   ├── order-ui.spec.ts
│   ├── api-orders.spec.ts
│   └── print-format.spec.ts
├── lib/                   # ライブラリ
│   └── supabase.ts        # Supabaseクライアント
├── packages/              # 共有パッケージ
│   └── shared/           # 共通型・ユーティリティ
│       ├── types.ts
│       ├── validation.ts
│       └── print-format.ts
├── public/               # 静的ファイル
│   └── menu.json        # メニューデータ
└── docs/                # ドキュメント
    ├── ARCHITECTURE.md
    ├── BUSINESS_LOGIC.md
    ├── DEVELOPMENT_RULES.md
    └── TEST_SPEC.md
```

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリを参照してください。

- [アーキテクチャ](./docs/ARCHITECTURE.md)
- [ビジネスロジック](./docs/BUSINESS_LOGIC.md)
- [開発ルール](./docs/DEVELOPMENT_RULES.md)
- [テスト仕様](./docs/TEST_SPEC.md)

## ライセンス

Private
