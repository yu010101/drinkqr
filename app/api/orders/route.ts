import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
// サーバーサイドではService Role Keyを使用してRLSをバイパス
// 注意: Service Role Keyが未設定の場合は明示的にエラー
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set');
}

interface OrderItem {
  name: string;
  qty: number;
}

interface OrderRequest {
  store_id?: string;
  table: string;
  items: OrderItem[];
}

interface OrderResponse {
  success: boolean;
  order_id?: string;
  error?: string;
}

/**
 * POST /api/orders
 * 注文を受け付けて、orders と print_jobs に保存する
 */
export async function POST(request: NextRequest): Promise<NextResponse<OrderResponse>> {
  try {
    const body: OrderRequest = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'リクエストボディが不正です' },
        { status: 400 }
      );
    }

    const { store_id, table, items } = body;

    // store_idの検証（オプショナルだが、指定された場合はUUID形式）
    if (store_id !== undefined && store_id !== null) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (typeof store_id !== 'string' || !uuidRegex.test(store_id)) {
        return NextResponse.json(
          { success: false, error: '無効な店舗IDです' },
          { status: 400 }
        );
      }
    }

    // バリデーション
    if (!table || typeof table !== 'string' || table.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'テーブル名が必要です' },
        { status: 400 }
      );
    }

    if (table.length > 10 || !/^[a-zA-Z0-9]+$/.test(table)) {
      return NextResponse.json(
        { success: false, error: '無効なテーブル名です' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '注文アイテムが必要です' },
        { status: 400 }
      );
    }

    // アイテム数の上限チェック（DoS対策）
    if (items.length > 100) {
      return NextResponse.json(
        { success: false, error: '一度に注文できるアイテム数は100個までです' },
        { status: 400 }
      );
    }

    // アイテムのバリデーション
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json(
          { success: false, error: '無効なアイテム名です' },
          { status: 400 }
        );
      }
      // アイテム名の長さ制限（100文字まで）
      if (item.name.length > 100) {
        return NextResponse.json(
          { success: false, error: 'アイテム名は100文字以内で指定してください' },
          { status: 400 }
        );
      }
      // 数量チェック（整数、1-100の範囲）
      if (typeof item.qty !== 'number' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100) {
        return NextResponse.json(
          { success: false, error: '数量は1〜100の整数で指定してください' },
          { status: 400 }
        );
      }
    }

    // Service Role Key未設定チェック
    if (!supabaseServiceKey) {
      console.error('Order API: SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 注文を作成
    const orderData: Record<string, unknown> = {
      table_name: table.trim().toUpperCase(),
      items: items.map((item) => ({ name: item.name, qty: item.qty })),
    };

    // store_idがある場合は追加
    if (store_id) {
      orderData.store_id = store_id;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      // ログには詳細を出力（運用監視用）
      console.error('Order creation error:', JSON.stringify(orderError, null, 2));
      console.error('Order data attempted:', JSON.stringify(orderData, null, 2));
      // クライアントには詳細を返さない（セキュリティ対策）
      return NextResponse.json(
        { success: false, error: 'データベースエラー' },
        { status: 500 }
      );
    }

    // 印刷用テキストを生成
    const printableText = generatePrintableText(table, items);

    // 印刷ジョブを作成
    const printJobData: Record<string, unknown> = {
      order_id: order.id,
      printable_text: printableText,
      status: 'queued',
      attempts: 0,
    };

    if (store_id) {
      printJobData.store_id = store_id;
    }

    await supabase.from('print_jobs').insert(printJobData);

    return NextResponse.json({
      success: true,
      order_id: order.id,
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    );
  }
}

function generatePrintableText(table: string, items: OrderItem[]): string {
  const lines: string[] = [];
  const width = 32;
  const divider = '-'.repeat(width);

  lines.push('');
  lines.push(centerText('【注文票】', width));
  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push(centerText(`テーブル: ${table.toUpperCase()}`, width));
  lines.push('');
  lines.push(divider);
  lines.push('');

  for (const item of items) {
    const itemLine = `${item.name}`;
    const qtyLine = `x${item.qty}`;
    const spaces = width - itemLine.length - qtyLine.length;
    lines.push(itemLine + ' '.repeat(Math.max(1, spaces)) + qtyLine);
  }

  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push(new Date().toLocaleString('ja-JP'));
  lines.push('');

  return lines.join('\n');
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}
