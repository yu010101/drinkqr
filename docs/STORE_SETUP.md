# 店舗セットアップガイド

DrinkQRを店舗で運用するための手順書です。

---

## 必要なもの

| アイテム | 詳細 |
|---------|------|
| レシートプリンター | SII MP-B20（USB接続） |
| 店内PC | Windows / Mac / Linux（Node.js 18以上） |
| QRコード | 各テーブルに設置 |
| Wi-Fi | Gateway用（店舗PCのインターネット接続用） |

---

## Step 1: QRコードの印刷・設置

### QRコード一覧を開く
```
qrcodes/index.html
```
をブラウザで開き、印刷してください。

### 設置
各テーブルにQRコードを設置します。お客様がスマホでスキャンしやすい位置に配置してください。

---

## Step 2: プリンターの接続

### SII MP-B20の場合

1. プリンターの電源を入れる
2. USBケーブルで店内PCに接続
3. プリンターが認識されることを確認

### 確認方法（Mac）
```bash
system_profiler SPUSBDataType | grep -A 5 "MP-B20"
```

### 確認方法（Windows）
デバイスマネージャーでプリンターが表示されることを確認

---

## Step 3: Gatewayの起動

### 初回セットアップ

```bash
# gatewayフォルダに移動
cd gateway

# 依存関係インストール（初回のみ）
npm install

# 設定ファイル確認
cat .env
```

### .envの設定

```env
SUPABASE_URL=https://jhewqzikdfqcevecamzd.supabase.co
SUPABASE_SERVICE_KEY=（サービスキー）

# テスト時はconsole、本番はusb
PRINTER_MODE=console
```

### Gatewayの起動

```bash
npm start
```

以下のような表示が出れば成功：
```
========================================
   DrinkQR Print Gateway
========================================
Mode: console
Supabase: https://jhewqzikdfqcevecamzd.supabase.co

Checking for queued jobs...
Subscribing to print_jobs...

Gateway is running. Waiting for orders...
Press Ctrl+C to stop.
```

---

## Step 4: 動作テスト

### 1. スマホでQRコードをスキャン
テーブルA1のQRコードをスキャン

### 2. メニューが表示されることを確認
URL: https://drinkqr.vercel.app/t/A1

### 3. ドリンクを選んで注文
- 生ビール × 2
- ハイボール × 1
- 「注文する」ボタンをタップ

### 4. 注文完了モーダルを確認
- 注文番号が表示される
- 注文内容が正しい

### 5. Gatewayのコンソールを確認
```
========================================
PRINTING JOB: XXXX
========================================
【注文票】
テーブル: A1
---
生ビール × 2
ハイボール × 1
---
注文時刻: 2026-01-16 23:45:00
========================================

Print job XXXX completed
```

### 6. 本番モードに切り替え
動作確認後、`.env`を編集：
```env
PRINTER_MODE=usb
```

Gatewayを再起動：
```bash
# Ctrl+C で停止後
npm start
```

---

## 日常運用

### 営業開始時
1. 店内PCの電源ON
2. プリンターの電源ON
3. Gatewayを起動
```bash
cd gateway && npm start
```

### 営業終了時
1. Gateway停止（Ctrl+C）
2. プリンター電源OFF
3. PC電源OFF（任意）

---

## トラブルシューティング

### 注文が印刷されない

1. **Gateway確認**: コンソールに「New print job received!」が出ているか
2. **プリンター確認**: USB接続、電源ON、用紙あり
3. **再起動**: Gateway再起動、プリンター再起動

### QRコードが読み取れない

- 印刷品質を確認
- 明るい場所で試す
- 手動入力: https://drinkqr.vercel.app で直接テーブル番号入力

### エラー: SUPABASE_URL is required

`.env`ファイルが正しく設定されているか確認

---

## メニュー変更

メニューを変更する場合は `public/menu.json` を編集し、Vercelに再デプロイしてください。

```json
[
  { "name": "生ビール", "price": 0, "category": "ビール" },
  { "name": "ハイボール", "price": 0, "category": "ウイスキー" },
  ...
]
```

---

## サポート

問題が発生した場合は、開発者に連絡してください。
