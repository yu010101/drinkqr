# 開発ドキュメント

このディレクトリには、飲み放題QR注文システムの開発ドキュメントが含まれています。

## ドキュメント一覧

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - システム全体のアーキテクチャと仕様
- **[BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md)** - ビジネスロジックと仕様の詳細
- **[DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)** - 開発ルールとコーディング規約（詳細版）
- **[DEV_RULES.md](./DEV_RULES.md)** - 開発ルールとコーディング規約（簡易版）
- **[TEST_SPEC.md](./TEST_SPEC.md)** - テスト仕様書
- **[TEST_SETUP.md](./TEST_SETUP.md)** - テストセットアップガイド

## クイックスタート

### 実装順序（推奨）

1. Supabase DDL
2. `/api/orders`
3. `printable_text` 生成
4. Realtime subscribe（ダミー受信）
5. Gateway CLI 骨格
6. MP-B20 Bluetooth 印刷
7. retry / dead 処理

### Cursor に最初に投げるプロンプト

```
このドキュメントに従って実装してください。
最初は Supabase の DDL と、
Next.js API Route（POST /api/orders）を実装してください。
print_jobs は Realtime 前提です。
```

## システム概要

- **目的**: QRコードから飲み放題メニューを注文し、自動でレシートプリンターに印刷
- **技術スタック**: Vercel + Next.js + Supabase + SII MP-B20
- **対象**: 1店舗PoC

詳細は [ARCHITECTURE.md](./ARCHITECTURE.md) を参照してください。

## テスト

テストの実行方法については [TEST_SETUP.md](./TEST_SETUP.md) を参照してください。
