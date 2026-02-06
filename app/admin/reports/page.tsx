'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

interface DailyStat {
  date: string;
  orderCount: number;
  itemCount: number;
}

interface ItemStat {
  name: string;
  count: number;
}

interface Order {
  id: string;
  created_at: string;
  items: { name: string; qty: number }[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7days' | '30days' | 'all'>('7days');
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [itemStats, setItemStats] = useState<ItemStat[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchStoreId = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (store) {
          setStoreId(store.id);
        }
      }
    };

    fetchStoreId();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchStats();
    }
  }, [storeId, period]);

  const fetchStats = async () => {
    if (!storeId) return;
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from('orders')
      .select('id, created_at, items')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (period === '7days') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      query = query.gte('created_at', date.toISOString());
    } else if (period === '30days') {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      query = query.gte('created_at', date.toISOString());
    }

    const { data: orders } = await query;

    if (orders) {
      processStats(orders as Order[]);
    }

    setLoading(false);
  };

  const processStats = (orders: Order[]) => {
    // 日別統計
    const dailyMap = new Map<string, { orderCount: number; itemCount: number }>();
    const itemMap = new Map<string, number>();

    let totalItemCount = 0;

    orders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString('ja-JP');

      const existing = dailyMap.get(date) || { orderCount: 0, itemCount: 0 };
      let orderItemCount = 0;

      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          orderItemCount += item.qty;
          const currentCount = itemMap.get(item.name) || 0;
          itemMap.set(item.name, currentCount + item.qty);
        });
      }

      totalItemCount += orderItemCount;
      dailyMap.set(date, {
        orderCount: existing.orderCount + 1,
        itemCount: existing.itemCount + orderItemCount,
      });
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const items = Array.from(itemMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setDailyStats(daily);
    setItemStats(items);
    setTotalOrders(orders.length);
    setTotalItems(totalItemCount);
  };

  const maxOrderCount = Math.max(...dailyStats.map((d) => d.orderCount), 1);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              color: '#f5f0e6',
              fontFamily: "'Shippori Mincho', serif",
            }}
          >
            売上レポート
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6a6a6a' }}>
            注文データの分析
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['7days', '30days', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '10px 20px',
                border: `1px solid ${period === p ? '#d4af37' : '#3a3a4a'}`,
                background: period === p ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: period === p ? '#d4af37' : '#6a6a6a',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
              }}
            >
              {p === '7days' ? '7日間' : p === '30days' ? '30日間' : '全期間'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6a6a6a',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          読み込み中...
        </div>
      ) : (
        <>
          {/* サマリー */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '8px', letterSpacing: '0.05em' }}>
                総注文数
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 600,
                  color: '#d4af37',
                  fontFamily: "'Shippori Mincho', serif",
                }}
              >
                {totalOrders}
                <span style={{ fontSize: '14px', color: '#6a6a6a', marginLeft: '4px' }}>件</span>
              </div>
            </div>
            <div
              style={{
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '8px', letterSpacing: '0.05em' }}>
                総アイテム数
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 600,
                  color: '#f5f0e6',
                  fontFamily: "'Shippori Mincho', serif",
                }}
              >
                {totalItems}
                <span style={{ fontSize: '14px', color: '#6a6a6a', marginLeft: '4px' }}>点</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* 日別グラフ */}
            <div
              style={{
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#f5f0e6',
                  fontFamily: "'Shippori Mincho', serif",
                }}
              >
                日別注文数
              </h3>
              {dailyStats.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6a6a6a' }}>
                  データがありません
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dailyStats.map((stat) => (
                    <div key={stat.date} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '80px', fontSize: '12px', color: '#6a6a6a' }}>
                        {stat.date}
                      </div>
                      <div style={{ flex: 1, height: '24px', background: '#0a0a0c', position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${(stat.orderCount / maxOrderCount) * 100}%`,
                            background: 'linear-gradient(90deg, #d4af37, #c9a227)',
                          }}
                        />
                      </div>
                      <div style={{ width: '40px', fontSize: '14px', color: '#f5f0e6', textAlign: 'right' }}>
                        {stat.orderCount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 人気メニューランキング */}
            <div
              style={{
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#f5f0e6',
                  fontFamily: "'Shippori Mincho', serif",
                }}
              >
                人気メニュー TOP10
              </h3>
              {itemStats.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6a6a6a' }}>
                  データがありません
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {itemStats.map((item, index) => (
                    <div
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: index < itemStats.length - 1 ? '1px solid #2a2a36' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: index < 3 ? '#d4af37' : '#6a6a6a',
                          background: index < 3 ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                          border: `1px solid ${index < 3 ? '#d4af37' : '#3a3a4a'}`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '13px', color: '#f5f0e6' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#d4af37', fontWeight: 600 }}>
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
