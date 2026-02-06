'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

interface MenuItem {
  name: string;
  category: string | null;
  price: number;
  is_available: boolean;
}

interface OrderResult {
  orderId: string;
  items: { name: string; qty: number }[];
}

export default function StoreTablePage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const table = params.table as string;

  const [storeName, setStoreName] = useState<string>('');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  useEffect(() => {
    if (!table || !/^[a-zA-Z0-9]+$/.test(table) || table.length > 10) {
      setError('無効なテーブル名です');
      setLoading(false);
      return;
    }

    const loadStoreAndMenu = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        // 店舗情報を取得
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name')
          .eq('slug', storeSlug)
          .single();

        if (storeError || !store) {
          setError('店舗が見つかりません');
          setLoading(false);
          return;
        }

        setStoreId(store.id);
        setStoreName(store.name);

        // メニューを取得
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select('name, category, price, is_available')
          .eq('store_id', store.id)
          .eq('is_available', true)
          .order('sort_order')
          .order('name');

        if (menuError) {
          setError('メニューを読み込めませんでした');
          setLoading(false);
          return;
        }

        if (!menuData || menuData.length === 0) {
          setError('メニューがありません');
          setLoading(false);
          return;
        }

        setMenu(menuData);
      } catch (err) {
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    loadStoreAndMenu();
  }, [storeSlug, table]);

  const handleQuantityChange = (itemName: string, qty: number) => {
    if (qty < 0 || qty > 10) return;

    setOrderItems((prev) => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[itemName];
      } else {
        next[itemName] = qty;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!storeId) return;

    const items = Object.entries(orderItems)
      .filter(([_, qty]) => qty > 0 && qty <= 10)
      .map(([name, qty]) => ({ name, qty }));

    if (items.length === 0) {
      setSubmitError('注文するアイテムを選択してください');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          table,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '注文に失敗しました');
      }

      setOrderResult({
        orderId: data.order_id?.slice(-4).toUpperCase() || '----',
        items,
      });
      setShowModal(true);
      setOrderItems({});
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '注文に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOrderResult(null);
  };

  const totalItems = Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#12121a',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #3a3a4a',
              borderTopColor: '#d4af37',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#9a9a9a', fontSize: '14px' }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#12121a',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#1c1c26',
            border: '2px solid #e63946',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '320px',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px', color: '#e63946' }}>!</div>
          <p style={{ color: '#e63946', fontSize: '15px' }}>{error}</p>
        </div>
      </div>
    );
  }

  const hasOrderItems = Object.values(orderItems).some((qty) => qty > 0);

  return (
    <>
      {/* 注文完了モーダル */}
      {showModal && orderResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 10, 12, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#1c1c26',
              border: '2px solid #d4af37',
              padding: '40px 32px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />

            <div
              style={{
                width: '64px',
                height: '64px',
                border: '3px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '28px',
                color: '#d4af37',
              }}
            >
              <span style={{ fontFamily: "'Shippori Mincho', serif" }}>承</span>
            </div>
            <h2
              style={{
                fontFamily: "'Shippori Mincho', serif",
                margin: '0 0 8px',
                fontSize: '22px',
                color: '#f5f0e6',
                letterSpacing: '0.1em',
              }}
            >
              注文完了
            </h2>
            <p style={{ color: '#9a9a9a', margin: '0 0 24px', fontSize: '13px' }}>
              注文番号: <span style={{ color: '#d4af37', fontWeight: 700 }}>#{orderResult.orderId}</span>
            </p>
            <div
              style={{
                background: '#0a0a0c',
                border: '1px solid #3a3a4a',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
              }}
            >
              {orderResult.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: idx < orderResult.items.length - 1 ? '1px solid #2a2a36' : 'none',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ color: '#f5f0e6' }}>{item.name}</span>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>x {item.qty}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontWeight: 700,
                background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                color: '#0a0a0c',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: '#12121a' }}>
        {/* ヘッダー */}
        <header
          style={{
            background: '#0a0a0c',
            borderBottom: '1px solid #3a3a4a',
            padding: '20px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Shippori Mincho', serif",
                    fontSize: '11px',
                    color: '#d4af37',
                    letterSpacing: '0.2em',
                    marginBottom: '4px',
                  }}
                >
                  {storeName}
                </div>
                <h1
                  style={{
                    fontFamily: "'Shippori Mincho', serif",
                    margin: 0,
                    fontSize: '24px',
                    color: '#f5f0e6',
                    letterSpacing: '0.05em',
                  }}
                >
                  テーブル <span style={{ color: '#d4af37' }}>{table}</span>
                </h1>
              </div>
              <div
                style={{
                  background: '#1c1c26',
                  border: '1px solid #3a3a4a',
                  padding: '8px 16px',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#9a9a9a' }}>選択中：</span>
                <span style={{ color: '#d4af37', fontWeight: 700, marginLeft: '4px' }}>{totalItems}杯</span>
              </div>
            </div>
          </div>
        </header>

        {/* メニューリスト */}
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          {submitError && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.3)',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#e63946', fontSize: '14px' }}>{submitError}</span>
              <button
                onClick={() => setSubmitError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e63946',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                x
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '100px' }}>
            {menu.map((item) => {
              const qty = orderItems[item.name] || 0;
              return (
                <div
                  key={item.name}
                  data-testid="menu-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: qty > 0 ? '#1c1c26' : '#161620',
                    border: qty > 0 ? '1px solid #d4af37' : '1px solid #2a2a36',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: '16px',
                        color: qty > 0 ? '#f5f0e6' : '#c5c5c5',
                        marginBottom: item.category ? '4px' : 0,
                      }}
                    >
                      {item.name}
                    </div>
                    {item.category && (
                      <div style={{ fontSize: '12px', color: '#6a6a6a' }}>{item.category}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleQuantityChange(item.name, qty - 1)}
                      disabled={qty === 0}
                      style={{
                        width: '44px',
                        height: '44px',
                        border: qty === 0 ? '1px solid #2a2a36' : '1px solid #e63946',
                        background: qty === 0 ? '#1c1c26' : 'transparent',
                        color: qty === 0 ? '#4a4a4a' : '#e63946',
                        fontSize: '22px',
                        fontWeight: 300,
                        cursor: qty === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      -
                    </button>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: qty > 0 ? '#d4af37' : '#6a6a6a',
                        background: '#0a0a0c',
                        border: '1px solid #2a2a36',
                      }}
                    >
                      {qty}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(item.name, qty + 1)}
                      disabled={qty >= 10}
                      style={{
                        width: '44px',
                        height: '44px',
                        border: qty >= 10 ? '1px solid #2a2a36' : '1px solid #d4af37',
                        background: qty >= 10 ? '#1c1c26' : 'transparent',
                        color: qty >= 10 ? '#4a4a4a' : '#d4af37',
                        fontSize: '22px',
                        fontWeight: 300,
                        cursor: qty >= 10 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* 固定フッター */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#0a0a0c',
            borderTop: '1px solid #3a3a4a',
            padding: '16px 24px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button
              onClick={handleSubmit}
              disabled={!hasOrderItems || submitting}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '17px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontWeight: 700,
                background:
                  hasOrderItems && !submitting
                    ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)'
                    : '#2a2a36',
                color: hasOrderItems && !submitting ? '#0a0a0c' : '#6a6a6a',
                border: 'none',
                cursor: hasOrderItems && !submitting ? 'pointer' : 'not-allowed',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? '送信中...' : `注文する（${totalItems}杯）`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
