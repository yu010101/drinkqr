import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

// ブラウザ用クライアント
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// サーバー用クライアント（Server Components, Route Handlers用）
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component内では書き込み不可
        }
      },
    },
  });
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 現在のユーザーの店舗を取得
export async function getCurrentStore() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return store;
}

// スラッグの生成（店舗名から）
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8);
}

// 店舗の作成
export async function createStore(name: string, userId: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from('stores')
    .insert({
      name,
      owner_id: userId,
      slug,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface Store {
  id: string;
  name: string;
  owner_id: string;
  slug: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_period_end?: string;
  plan_id?: string;
}
