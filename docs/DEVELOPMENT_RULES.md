# 開発ルール（詳細版）

## 1. コード規約

### 1.1 言語とフレームワーク

- **TypeScript**: 必須（JavaScript禁止）
- **Next.js**: App Router使用
- **Node.js**: 18以上

### 1.2 型定義

- すべての関数・変数に型を明示
- `any` は原則禁止（やむを得ない場合は `unknown` を使用）
- インターフェースは `packages/shared` に定義

### 1.3 命名規則

- **ファイル名**: kebab-case（例: `order-api.ts`）
- **コンポーネント名**: PascalCase（例: `OrderForm`）
- **関数名**: camelCase（例: `createOrder`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_QUANTITY`）
- **型・インターフェース**: PascalCase（例: `OrderItem`）

### 1.4 インポート順序

1. 外部ライブラリ
2. 内部パッケージ（`@/packages/shared` など）
3. 相対パス（`./`, `../`）

### 1.5 コメント

- 複雑なロジックには必ずコメント
- JSDoc形式で関数の説明を記述
- TODOコメントは `// TODO: 説明` 形式

## 2. エラーハンドリング

### 2.1 原則

- すべての非同期処理に try-catch
- エラーは必ずログに記録
- ユーザー向けエラーメッセージは分かりやすく

### 2.2 エラーレスポンス形式

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}
```

### 2.3 タイムアウト設定

- API Route: 10秒
- データベースクエリ: 5秒
- 印刷処理: 30秒
- Bluetooth接続: 10秒

## 3. ログ仕様

### 3.1 ログレベル

- `error`: エラー（必ず対応が必要）
- `warn`: 警告（注意が必要）
- `info`: 情報（重要な処理の記録）
- `debug`: デバッグ（開発時のみ）

### 3.2 ログ形式

すべてのログは **1行JSON形式** で stdout に出力。

```typescript
interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  timestamp: string;      // ISO8601形式
  message: string;
  job_id?: string;
  order_id?: string;
  error_code?: string;
  [key: string]: unknown; // 追加フィールド
}
```

### 3.3 ログ出力例

```json
{"level":"info","timestamp":"2026-01-09T19:32:00Z","message":"Order created","order_id":"123e4567-e89b-12d3-a456-426614174000"}
{"level":"error","timestamp":"2026-01-09T19:32:05Z","message":"Print failed","job_id":"123e4567-e89b-12d3-a456-426614174001","error_code":"BT_DISCONNECTED"}
```

## 4. テスト規約

### 4.1 テストファイル配置

- Playwright: `apps/web/e2e/*.spec.ts`
- ユニットテスト: `**/*.test.ts` または `**/*.spec.ts`

### 4.2 テスト命名

- テスト名は日本語可（わかりやすさ優先）
- 形式: `describe('機能名', () => { it('正常系: 説明', ...) })`

### 4.3 テストカバレッジ

- 正常系: 必須
- 異常系: 必須
- エッジケース: 可能な限り

## 5. Git運用

### 5.1 コミットメッセージ

- 形式: `[種別] 簡潔な説明`
- 種別: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- 例: `[feat] 注文API実装`

### 5.2 ブランチ運用

- `main`: 本番相当
- `develop`: 開発ブランチ
- `feature/*`: 機能追加
- `fix/*`: バグ修正

### 5.3 1コミット = 1目的

- 1つのコミットには1つの明確な目的のみ
- 複数の変更をまとめない
- レビューしやすい単位でコミット

## 6. 環境変数

### 6.1 命名規則

- 大文字スネークケース
- プレフィックス: `NEXT_PUBLIC_` (クライアント側), なし（サーバー側）

### 6.2 必須環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gateway
SUPABASE_URL=
SUPABASE_ANON_KEY=
PRINTER_MAC_ADDRESS=
```

### 6.3 環境変数管理

- `.env.example` にテンプレートを記載
- `.env.local` は gitignore
- 本番環境は Vercel の環境変数設定を使用

## 7. パフォーマンス要件

### 7.1 API Route

- 処理時間: 10ms〜（軽量に保つ）
- レスポンスサイズ: 最小限
- データベースクエリ: 必要最小限

### 7.2 UI

- 初回ロード: 2秒以内
- インタラクション応答: 100ms以内
- メニュー表示: 即座に

## 8. セキュリティ

### 8.1 入力検証

- すべてのユーザー入力を検証
- XSS対策: Reactの自動エスケープを活用
- SQLインジェクション: Supabaseクライアント使用

### 8.2 認証・認可

- 現時点では認証なし（PoC）
- 将来的な拡張を考慮した設計

## 9. 依存関係管理

### 9.1 パッケージ追加

- 必要最小限の依存関係のみ
- ライセンス確認必須
- セキュリティ脆弱性チェック

### 9.2 バージョン固定

- `package.json` でバージョンを固定
- `package-lock.json` をコミット

## 10. ドキュメント

### 10.1 コードドキュメント

- 公開APIはJSDocで説明
- 複雑なロジックにはコメント

### 10.2 仕様ドキュメント

- `docs/` 配下にMarkdown形式で記載
- 変更時はドキュメントも更新

## 11. リファクタリング

### 11.1 原則

- 動作を変えずにコードを改善
- テストが通ることを確認
- 小さなステップで実施

### 11.2 タイミング

- 機能追加前
- バグ修正時
- コードレビュー時
