import { NextRequest, NextResponse } from 'next/server';
import { validateOrderRequest } from '@/packages/shared/validation';
import { generatePrintableText } from '@/packages/shared/print-format';
import { createOrder, createPrintJob } from '@/lib/supabase';
import { OrderResponse } from '@/packages/shared/types';

/**
 * POST /api/orders
 * 注文を受け付けて、orders と print_jobs に保存する
 */
export async function POST(request: NextRequest): Promise<NextResponse<OrderResponse>> {
  try {
    // リクエストボディを取得
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'リクエストボディが不正です' },
        { status: 400 }
      );
    }
    
    // バリデーション
    const validation = validateOrderRequest(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'バリデーションエラー' },
        { status: 400 }
      );
    }
    
    const { table, items } = validation.data;
    
    // タイムアウト設定（10秒）
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('タイムアウト')), 10000);
    });
    
    // 注文処理
    const processOrder = async () => {
      // orders テーブルにINSERT
      const order = await createOrder(table, items);
      
      // printable_text を生成
      const printableText = generatePrintableText(table, items);
      
      // print_jobs テーブルにINSERT
      await createPrintJob(order.id, printableText);
      
      return order.id;
    };
    
    const orderId = await Promise.race([processOrder(), timeoutPromise]);
    
    return NextResponse.json({
      success: true,
      order_id: orderId,
    });
    
  } catch (error) {
    console.error('Order API error:', error);
    
    if (error instanceof Error && error.message === 'タイムアウト') {
      return NextResponse.json(
        { success: false, error: 'タイムアウト' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'データベースエラー' },
      { status: 500 }
    );
  }
}
