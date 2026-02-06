import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FOUNDING_MEMBER_LIMIT } from '@/lib/plans';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Count current founding members
    const { count, error } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', 'standard_founding')
      .in('subscription_status', ['active', 'trialing']);

    if (error) {
      console.error('Error counting founding members:', error);
      return NextResponse.json(
        { error: 'データ取得エラー' },
        { status: 500 }
      );
    }

    const currentCount = count || 0;
    const remaining = Math.max(0, FOUNDING_MEMBER_LIMIT - currentCount);
    const available = remaining > 0;

    return NextResponse.json({
      available,
      remaining,
      total: FOUNDING_MEMBER_LIMIT,
      currentCount,
    });
  } catch (error) {
    console.error('Founding status API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラー' },
      { status: 500 }
    );
  }
}
