'use client';

import { useEffect, useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  table_name: string;
  items: OrderItem[];
  created_at: string;
  store_id?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const printQueueRef = useRef<Order[]>([]);
  const isPrintingRef = useRef(false);

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();

      setTimeout(() => { oscillator.frequency.value = 1000; }, 150);
      setTimeout(() => { oscillator.frequency.value = 800; }, 300);
      setTimeout(() => { oscillator.frequency.value = 1000; }, 450);
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 600);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const fetchOrders = async (currentStoreId: string | null) => {
    if (!currentStoreId) return;

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from('orders')
      .select('*')
      .eq('store_id', currentStoreId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('created_at', today.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  // 店舗IDを取得
  useEffect(() => {
    const getStore = async () => {
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

    getStore();
  }, []);

  useEffect(() => {
    if (!storeId) return;

    fetchOrders(storeId);

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);
          playNotificationSound();
          if (autoPrint) {
            queuePrint(newOrder);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [storeId, filter, soundEnabled, autoPrint]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const processNextPrint = () => {
    if (isPrintingRef.current || printQueueRef.current.length === 0) return;

    isPrintingRef.current = true;
    const order = printQueueRef.current.shift()!;
    setPrintingOrder(order);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        isPrintingRef.current = false;
        setPrintingOrder(null);
        processNextPrint();
      }, 500);
    }, 100);
  };

  const queuePrint = (order: Order) => {
    printQueueRef.current.push(order);
    processNextPrint();
  };

  const handlePrint = (order: Order) => {
    queuePrint(order);
  };

  const stats = {
    orderCount: orders.length,
    totalDrinks: orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.qty, 0), 0),
    tableCount: new Set(orders.map((o) => o.table_name)).size,
  };

  return (
    <>
      {/* 印刷用レイアウト */}
      {printingOrder && (
        <div id="print-area" className="print-only">
          <div
            style={{
              width: '72mm',
              padding: '5mm',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
              【注文票】
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                border: '2px solid black',
                padding: '10px',
                marginBottom: '15px',
              }}
            >
              {printingOrder.table_name}
            </div>
            <div style={{ borderTop: '1px dashed black', paddingTop: '10px', marginBottom: '10px' }}>
              {printingOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px 0',
                    fontSize: '16px',
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>x{item.qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px dashed black', paddingTop: '10px', fontSize: '12px', color: '#666' }}>
              <div>注文時刻: {new Date(printingOrder.created_at).toLocaleString('ja-JP')}</div>
              <div>#{printingOrder.id.slice(-6).toUpperCase()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 通常表示 */}
      <div className="no-print" style={{ minHeight: '100vh', background: '#12121a' }} data-store-id={storeId || ''}>
        {/* ヘッダー */}
        <header
          style={{
            background: '#0a0a0c',
            borderBottom: '1px solid #3a3a4a',
            padding: '24px 32px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
                  ADMIN
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
                  注文一覧
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setAutoPrint(!autoPrint)}
                  style={{
                    padding: '10px 16px',
                    border: autoPrint ? '1px solid #d4af37' : '1px solid #3a3a4a',
                    background: autoPrint ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: autoPrint ? '#d4af37' : '#9a9a9a',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  自動印刷 {autoPrint ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{
                    padding: '10px 16px',
                    border: soundEnabled ? '1px solid #d4af37' : '1px solid #3a3a4a',
                    background: soundEnabled ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: soundEnabled ? '#d4af37' : '#9a9a9a',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  通知音 {soundEnabled ? 'ON' : 'OFF'}
                </button>
                <div style={{ display: 'flex', border: '1px solid #3a3a4a' }}>
                  <button
                    onClick={() => setFilter('today')}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      background: filter === 'today' ? '#d4af37' : 'transparent',
                      color: filter === 'today' ? '#0a0a0c' : '#9a9a9a',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                      fontWeight: filter === 'today' ? 700 : 400,
                    }}
                  >
                    今日
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderLeft: '1px solid #3a3a4a',
                      background: filter === 'all' ? '#d4af37' : 'transparent',
                      color: filter === 'all' ? '#0a0a0c' : '#9a9a9a',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                      fontWeight: filter === 'all' ? 700 : 400,
                    }}
                  >
                    すべて
                  </button>
                </div>
                <button
                  onClick={() => fetchOrders(storeId)}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #3a3a4a',
                    background: 'transparent',
                    color: '#9a9a9a',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
          {/* 統計 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {[
              { label: '注文数', value: stats.orderCount },
              { label: '合計杯数', value: stats.totalDrinks },
              { label: 'テーブル数', value: stats.tableCount },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#1c1c26',
                  border: '1px solid #2a2a36',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#6a6a6a', marginBottom: '8px', letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Shippori Mincho', serif",
                    fontSize: '36px',
                    color: '#d4af37',
                    fontWeight: 600,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* ヒント */}
          <div
            style={{
              background: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '16px 20px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#c9b896',
            }}
          >
            この画面を開いたままにしておくと、新規注文が来たら自動で印刷ダイアログが開きます。
          </div>

          {/* 注文リスト */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6a6a6a' }}>
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
              読み込み中...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 40px',
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                color: '#6a6a6a',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>—</div>
              <div>注文がありません</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  style={{
                    background: index === 0 ? '#1c1c26' : '#161620',
                    border: index === 0 ? '2px solid #d4af37' : '1px solid #2a2a36',
                    padding: '24px',
                    position: 'relative',
                  }}
                >
                  {index === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '16px',
                        background: '#d4af37',
                        color: '#0a0a0c',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      NEW
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        background: '#d4af37',
                        color: '#0a0a0c',
                        padding: '8px 20px',
                        fontFamily: "'Shippori Mincho', serif",
                        fontWeight: 700,
                        fontSize: '20px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {order.table_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6a6a6a' }}>
                      {filter === 'all' && (
                        <span style={{ marginRight: '8px' }}>{formatDate(order.created_at)}</span>
                      )}
                      {formatTime(order.created_at)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid #2a2a36' : 'none',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ color: '#f5f0e6' }}>{item.name}</span>
                        <span style={{ color: '#d4af37', fontWeight: 700 }}>x{item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#4a4a4a', fontFamily: 'monospace' }}>
                      #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <button
                      onClick={() => handlePrint(order)}
                      style={{
                        padding: '10px 24px',
                        border: '1px solid #3a3a4a',
                        background: 'transparent',
                        color: '#9a9a9a',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: "'Zen Kaku Gothic New', sans-serif",
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#d4af37';
                        e.currentTarget.style.color = '#d4af37';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#3a3a4a';
                        e.currentTarget.style.color = '#9a9a9a';
                      }}
                    >
                      印刷
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
