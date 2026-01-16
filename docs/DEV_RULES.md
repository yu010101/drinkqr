# 開発ルール

## 基本原則

1. **1コミット = 1目的**
   - 1つのコミットには1つの明確な目的のみを含める
   - 複数の変更をまとめない

2. **Realtimeを主線にする**
   - ポーリングは禁止
   - Supabase Realtime を積極的に活用
   - `print_jobs` の INSERT / UPDATE を購読

3. **IOは必ず timeout + retry**
   - すべてのI/O操作にタイムアウトを設定
   - 失敗時は適切なリトライロジックを実装

4. **印刷系は必ずログを残す**
   - 印刷ジョブの開始・成功・失敗を必ずログに記録
   - エラーコードとメッセージを含める

## ログ形式

すべてのログは **1行JSON形式** で stdout に出力する。

```json
{
  "level": "error|info|warn|debug",
  "job_id": "uuid",
  "error_code": "BT_DISCONNECTED",
  "message": "printer disconnected",
  "timestamp": "2026-01-09T19:32:00Z"
}
```

## エラーハンドリング

### エラーコード一覧

- `BT_DISCONNECTED` - Bluetooth接続が切断された
- `PRINTER_NOT_FOUND` - プリンターが見つからない
- `PRINT_TIMEOUT` - 印刷がタイムアウトした
- `PRINT_FAILED` - 印刷が失敗した
- `UNKNOWN` - 不明なエラー

### リトライ戦略

- `print_jobs` の `attempts` が 5 未満の場合：`status` を `failed` → `queued` に戻す
- `attempts` が 5 以上の場合：`status` を `dead` に設定

## コードスタイル

- TypeScript を使用
- 型安全性を重視
- 非同期処理は async/await を使用
- エラーハンドリングは明示的に記述

## テスト

- Gateway CLI の各コマンドは動作確認可能な状態にする
- `gateway test-print` で印刷テストが可能にする
- `gateway status` で接続状態を確認できるようにする
