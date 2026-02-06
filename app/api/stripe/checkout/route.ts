import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { PLANS, FOUNDING_MEMBER_LIMIT, type PlanId } from '@/lib/plans';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  console.log('Checkout API called');
  try {
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('PRICE_STARTER exists:', !!process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER);
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
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    // Get plan from request body
    const body = await request.json().catch(() => ({}));
    const planId = (body.planId as PlanId) || 'starter';

    // Validate plan exists
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
    }

    // Check founding member availability
    if (planId === 'standard_founding') {
      if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
      }

      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      const { count } = await adminSupabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', 'standard_founding')
        .in('subscription_status', ['active', 'trialing']);

      if ((count || 0) >= FOUNDING_MEMBER_LIMIT) {
        return NextResponse.json(
          { error: '創業メンバー枠は満員です' },
          { status: 400 }
        );
      }
    }

    // Get Stripe price ID - must use static access for NEXT_PUBLIC_ vars
    const PRICE_IDS: Record<PlanId, string | undefined> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
      standard: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD,
      standard_founding: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_FOUNDING,
      pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    };
    console.log('Price IDs available:', {
      starter: !!PRICE_IDS.starter,
      standard: !!PRICE_IDS.standard,
      standard_founding: !!PRICE_IDS.standard_founding,
      pro: !!PRICE_IDS.pro,
    });
    console.log('Selected plan:', planId);
    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      console.error(`Price ID not configured for plan: ${planId}`);
      return NextResponse.json(
        { error: 'プランの設定エラーです' },
        { status: 500 }
      );
    }
    console.log('Using price ID:', priceId);

    // Get or create Stripe customer
    let customerId = store.stripe_customer_id;
    console.log('Existing customer ID:', customerId);

    if (!customerId) {
      console.log('Creating new Stripe customer...');
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            store_id: store.id,
            user_id: user.id,
          },
        });
        customerId = customer.id;
        console.log('Created customer:', customerId);

        await supabase
          .from('stores')
          .update({ stripe_customer_id: customerId })
          .eq('id', store.id);
      } catch (customerError) {
        console.error('Error creating customer:', customerError);
        throw customerError;
      }
    }

    console.log('Creating checkout session...');
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            store_id: store.id,
            plan_id: planId,
          },
        },
        success_url: `${request.headers.get('origin')}/admin/settings?success=true`,
        cancel_url: `${request.headers.get('origin')}/admin/settings?canceled=true`,
        metadata: {
          store_id: store.id,
          plan_id: planId,
        },
      });
      console.log('Checkout session created:', session.id);
      return NextResponse.json({ url: session.url });
    } catch (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Stripe checkout error:', errorMessage, error);
    return NextResponse.json({
      error: 'チェックアウトの作成に失敗しました',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
