import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// 設定
const BASE_URL = 'https://drinkqr.vercel.app';
const TABLES = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2'];
const OUTPUT_DIR = './public/qrcodes';

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// QRコード生成
async function generateQRCodes() {
  console.log('Generating QR codes...\n');

  for (const table of TABLES) {
    const url = `${BASE_URL}/t/${table}`;
    const filename = path.join(OUTPUT_DIR, `table-${table}.png`);

    await QRCode.toFile(filename, url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    console.log(`✓ ${table}: ${filename}`);
  }

  // 一覧HTMLも生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>DrinkQR - テーブルQRコード一覧</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
    .card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card img { width: 150px; height: 150px; }
    .card h3 { margin: 10px 0 5px; font-size: 24px; }
    .card p { color: #666; font-size: 12px; margin: 0; word-break: break-all; }
    @media print {
      .card { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>DrinkQR - テーブルQRコード</h1>
  <div class="grid">
    ${TABLES.map(table => `
    <div class="card">
      <img src="table-${table}.png" alt="Table ${table}">
      <h3>テーブル ${table}</h3>
      <p>${BASE_URL}/t/${table}</p>
    </div>`).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
  console.log(`\n✓ 一覧HTML: ${OUTPUT_DIR}/index.html`);

  console.log('\n完了！');
  console.log(`QRコードは ${OUTPUT_DIR} フォルダに保存されました`);
  console.log('index.htmlをブラウザで開くと、印刷用の一覧が表示されます');
}

generateQRCodes().catch(console.error);
