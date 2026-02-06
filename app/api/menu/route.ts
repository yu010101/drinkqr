import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

async function getAuthenticatedStoreId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, storeId: null };

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  return { supabase, storeId: store?.id || null };
}

// GET: メニュー取得
export async function GET() {
  try {
    const { supabase, storeId } = await getAuthenticatedStoreId();

    if (!storeId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { data: menus, error } = await supabase
      .from('menus')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching menus:', error);
      return NextResponse.json({ error: 'メニューの読み込みに失敗しました' }, { status: 500 });
    }

    // フロントエンド用にフォーマット
    const formattedMenus = (menus || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.is_available,
    }));

    return NextResponse.json(formattedMenus);
  } catch (error) {
    console.error('Error reading menu:', error);
    return NextResponse.json({ error: 'メニューの読み込みに失敗しました' }, { status: 500 });
  }
}

// PUT: メニュー更新（全置換）
export async function PUT(request: Request) {
  try {
    const { supabase, storeId } = await getAuthenticatedStoreId();

    if (!storeId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const menu = await request.json();

    // バリデーション
    if (!Array.isArray(menu)) {
      return NextResponse.json({ error: 'メニューは配列である必要があります' }, { status: 400 });
    }

    // アイテム数上限チェック（DoS対策）
    if (menu.length > 500) {
      return NextResponse.json({ error: 'メニューアイテムは500個までです' }, { status: 400 });
    }

    for (const item of menu) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json({ error: '各アイテムにはnameが必要です' }, { status: 400 });
      }
      if (item.name.length > 100) {
        return NextResponse.json({ error: 'アイテム名は100文字以内で指定してください' }, { status: 400 });
      }
      if (item.price !== undefined && item.price !== null) {
        if (typeof item.price !== 'number' || item.price < 0 || !Number.isInteger(item.price)) {
          return NextResponse.json({ error: '価格は0以上の整数で指定してください' }, { status: 400 });
        }
      }
      if (item.category && (typeof item.category !== 'string' || item.category.length > 50)) {
        return NextResponse.json({ error: 'カテゴリは50文字以内で指定してください' }, { status: 400 });
      }
    }

    // 既存メニューを削除
    const { error: deleteError } = await supabase
      .from('menus')
      .delete()
      .eq('store_id', storeId);

    if (deleteError) {
      console.error('Error deleting menus:', deleteError);
      return NextResponse.json({ error: 'メニューの更新に失敗しました' }, { status: 500 });
    }

    // 新しいメニューを挿入
    if (menu.length > 0) {
      const menusToInsert = menu.map((item, index) => ({
        store_id: storeId,
        name: item.name,
        price: item.price || 0,
        category: item.category || null,
        sort_order: index,
        is_available: item.available !== false,
      }));

      const { error } = await supabase
        .from('menus')
        .insert(menusToInsert);

      if (error) {
        console.error('Error saving menus:', error);
        return NextResponse.json({ error: 'メニューの保存に失敗しました' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving menu:', error);
    return NextResponse.json({ error: 'メニューの保存に失敗しました' }, { status: 500 });
  }
}
