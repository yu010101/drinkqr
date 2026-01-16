import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MENU_PATH = path.join(process.cwd(), 'public', 'menu.json');

// GET: メニュー取得
export async function GET() {
  try {
    const data = fs.readFileSync(MENU_PATH, 'utf-8');
    const menu = JSON.parse(data);
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error reading menu:', error);
    return NextResponse.json({ error: 'メニューの読み込みに失敗しました' }, { status: 500 });
  }
}

// PUT: メニュー更新
export async function PUT(request: Request) {
  try {
    const menu = await request.json();

    // バリデーション
    if (!Array.isArray(menu)) {
      return NextResponse.json({ error: 'メニューは配列である必要があります' }, { status: 400 });
    }

    for (const item of menu) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json({ error: '各アイテムにはnameが必要です' }, { status: 400 });
      }
    }

    // ファイル保存
    fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2), 'utf-8');

    return NextResponse.json({ success: true, menu });
  } catch (error) {
    console.error('Error saving menu:', error);
    return NextResponse.json({ error: 'メニューの保存に失敗しました' }, { status: 500 });
  }
}
