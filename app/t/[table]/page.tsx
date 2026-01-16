'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MenuItem, OrderResponse } from '@/packages/shared/types';

interface OrderResult {
  orderId: string;
  items: { name: string; qty: number }[];
}

export default function TablePage() {
  const params = useParams();
  const table = params.table as string;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  
  // テーブル名のバリデーション
  useEffect(() => {
    if (!table || table.trim().length === 0) {
      setError('無効なテーブル名です');
      setLoading(false);
      return;
    }
    
    if (table.length > 10) {
      setError('無効なテーブル名です');
      setLoading(false);
      return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(table)) {
      setError('無効なテーブル名です');
      setLoading(false);
      return;
    }
  }, [table]);
  
  // メニューを読み込む
  useEffect(() => {
    if (error) return;
    
    const loadMenu = async () => {
      try {
        const response = await fetch('/menu.json');
        if (!response.ok) {
          throw new Error('メニューを読み込めませんでした');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          setError('メニューを読み込めませんでした');
          return;
        }
        
        setMenu(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メニューを読み込めませんでした');
      } finally {
        setLoading(false);
      }
    };
    
    loadMenu();
  }, [error]);
  
  // 数量変更ハンドラ
  const handleQuantityChange = (itemName: string, qty: number) => {
    if (qty < 0 || qty > 10) return;
    
    setOrderItems(prev => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[itemName];
      } else {
        next[itemName] = qty;
      }
      return next;
    });
  };
  
  // 注文送信
  const handleSubmit = async () => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          items,
        }),
      });

      const data: OrderResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '注文に失敗しました');
      }

      // 注文成功：モーダル表示
      setOrderResult({
        orderId: data.order_id?.slice(-4).toUpperCase() || '----',
        items: items,
      });
      setShowModal(true);
      setOrderItems({});

    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '注文に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setOrderResult(null);
  };
  
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }
  
  const hasOrderItems = Object.values(orderItems).some(qty => qty > 0);

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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#d4edda',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '30px',
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '22px' }}>注文完了</h2>
            <p style={{ color: '#666', margin: '0 0 20px', fontSize: '14px' }}>
              注文番号: #{orderResult.orderId}
            </p>
            <div
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              {orderResult.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px 0',
                    borderBottom: idx < orderResult.items.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>× {item.qty}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 5px', fontSize: '24px' }}>テーブル {table}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>飲み放題メニュー</p>
        </div>

        {submitError && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              marginBottom: '20px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{submitError}</span>
            <button
              onClick={() => setSubmitError(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#721c24',
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
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
                  padding: '15px',
                  border: '1px solid #ddd',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  backgroundColor: qty > 0 ? '#f0f7ff' : 'white',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</div>
                  {item.category && (
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {item.category}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleQuantityChange(item.name, qty - 1)}
                    disabled={qty === 0}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: qty === 0 ? '#e9ecef' : '#dc3545',
                      color: qty === 0 ? '#999' : 'white',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      cursor: qty === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                    }}
                  >
                    {qty}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(item.name, qty + 1)}
                    disabled={qty >= 10}
                    style={{
                      width: '48px',
                      height: '48px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: qty >= 10 ? '#e9ecef' : '#28a745',
                      color: qty >= 10 ? '#999' : 'white',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      cursor: qty >= 10 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!hasOrderItems || submitting}
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: hasOrderItems && !submitting ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: hasOrderItems && !submitting ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? '送信中...' : '注文する'}
        </button>
      </div>
    </>
  );
}
