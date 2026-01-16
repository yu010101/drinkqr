'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  table_name: string;
  items: OrderItem[];
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const printQueueRef = useRef<Order[]>([]);
  const isPrintingRef = useRef(false);

  // 通知音を鳴らす
  const playNotificationSound = () => {
    if (!soundEnabled) return;

    // Web Audio APIで通知音を生成
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

      // ピンポン音
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

  // 注文を取得
  const fetchOrders = async () => {
    setLoading(true);

    let query = supabase
      .from('orders')
      .select('*')
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

  useEffect(() => {
    fetchOrders();

    // リアルタイム購読
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);
          playNotificationSound();
          // 自動印刷
          if (autoPrint) {
            queuePrint(newOrder);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filter, soundEnabled, autoPrint]);

  // 時刻フォーマット
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 印刷キューを処理
  const processNextPrint = () => {
    if (isPrintingRef.current || printQueueRef.current.length === 0) return;

    isPrintingRef.current = true;
    const order = printQueueRef.current.shift()!;
    setPrintingOrder(order);

    setTimeout(() => {
      window.print();
      // 印刷ダイアログが閉じた後に次を処理
      setTimeout(() => {
        isPrintingRef.current = false;
        setPrintingOrder(null);
        processNextPrint();
      }, 500);
    }, 100);
  };

  // 印刷キューに追加
  const queuePrint = (order: Order) => {
    printQueueRef.current.push(order);
    processNextPrint();
  };

  // 手動印刷
  const handlePrint = (order: Order) => {
    queuePrint(order);
  };

  return (
    <>
      {/* 印刷用レイアウト */}
      {printingOrder && (
        <div id="print-area" className="print-only">
          <div style={{
            width: '72mm',
            padding: '5mm',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
              【注文票】
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              border: '2px solid black',
              padding: '10px',
              marginBottom: '15px',
            }}>
              {printingOrder.table_name}
            </div>
            <div style={{ borderTop: '1px dashed black', paddingTop: '10px', marginBottom: '10px' }}>
              {printingOrder.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 0',
                  fontSize: '16px',
                }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>×{item.qty}</span>
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
      <div className="no-print" style={{ padding: '30px' }}>
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          .print-only {
            display: none;
          }
          @media print {
            .print-only {
              display: block !important;
            }
          }
        `}</style>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px' }}>注文一覧</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: autoPrint ? '#28a745' : '#6c757d',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {autoPrint ? '🖨️ 自動印刷ON' : '🖨️ 自動印刷OFF'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: soundEnabled ? '#007bff' : '#6c757d',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {soundEnabled ? '🔔 通知ON' : '🔕 通知OFF'}
            </button>
            <button
              onClick={() => setFilter('today')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: filter === 'today' ? '#007bff' : '#e0e0e0',
                color: filter === 'today' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              今日
            </button>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: filter === 'all' ? '#007bff' : '#e0e0e0',
                color: filter === 'all' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              すべて
            </button>
            <button
              onClick={fetchOrders}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#6c757d',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              更新
            </button>
          </div>
        </div>

        {/* 統計 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '25px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              注文数
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {orders.length}
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              合計杯数
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {orders.reduce(
                (sum, order) =>
                  sum + order.items.reduce((s, item) => s + item.qty, 0),
                0
              )}
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              テーブル数
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {new Set(orders.map((o) => o.table_name)).size}
            </div>
          </div>
        </div>

        {/* 使い方ヒント */}
        <div
          style={{
            backgroundColor: '#e7f3ff',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#0056b3',
          }}
        >
          💡 この画面を開いたままにしておくと、新規注文が来たら自動で印刷ダイアログが開きます。印刷ダイアログが出たらEnterキーで印刷できます。
        </div>

        {/* 注文リスト */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            読み込み中...
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              backgroundColor: 'white',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            注文がありません
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px',
            }}
          >
            {orders.map((order, index) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: index === 0 ? '#fffde7' : 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: index === 0
                    ? '0 0 0 3px #ffc107, 0 2px 8px rgba(0,0,0,0.15)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '18px',
                    }}
                  >
                    {order.table_name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {filter === 'all' && (
                      <span style={{ marginRight: '8px' }}>
                        {formatDate(order.created_at)}
                      </span>
                    )}
                    {formatTime(order.created_at)}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom:
                          idx < order.items.length - 1
                            ? '1px solid #eee'
                            : 'none',
                        fontSize: '15px',
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ fontWeight: 'bold' }}>×{item.qty}</span>
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
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    #{order.id.slice(-6).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handlePrint(order)}
                    style={{
                      padding: '8px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    🖨️ 印刷
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
