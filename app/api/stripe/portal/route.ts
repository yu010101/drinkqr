import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    // Create Supabase client using request cookies directly
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Response cookies are handled by middleware
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('stripe_customer_id')
      .eq('owner_id', user.id)
      .single();

    if (!store?.stripe_customer_id) {
      return NextResponse.json({ error: 'サブスクリプションが見つかりません' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: store.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/admin/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json({ error: 'ポータルの作成に失敗しました' }, { status: 500 });
  }
}
