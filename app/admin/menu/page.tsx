'use client';

import { useEffect, useState } from 'react';

interface MenuItem {
  id?: string;
  name: string;
  price?: number;
  category?: string;
  available?: boolean;
}

export default function MenuEditPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '保存しました' });
        fetchMenu();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '保存に失敗しました' });
      }
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string | number | boolean) => {
    const newMenu = [...menu];
    newMenu[index] = { ...newMenu[index], [field]: value };
    setMenu(newMenu);
  };

  const addItem = () => {
    setMenu([...menu, { name: '', price: 0, category: '', available: true }]);
  };

  const removeItem = (index: number) => {
    if (confirm('このアイテムを削除しますか？')) {
      setMenu(menu.filter((_, i) => i !== index));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...menu];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menu.length) return;
    [newMenu[index], newMenu[targetIndex]] = [newMenu[targetIndex], newMenu[index]];
    setMenu(newMenu);
  };

  const categories = [...new Set(menu.map((item) => item.category).filter(Boolean))];

  if (loading) {
    return (
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
    );
  }

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
            メニュー編集
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6a6a6a' }}>
            {menu.length} 件のメニュー
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {message && (
            <span
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                background: message.type === 'success' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(230, 57, 70, 0.15)',
                color: message.type === 'success' ? '#d4af37' : '#e63946',
                border: `1px solid ${message.type === 'success' ? '#d4af37' : '#e63946'}`,
              }}
            >
              {message.text}
            </span>
          )}
          <button
            onClick={addItem}
            style={{
              padding: '12px 20px',
              border: '1px solid #d4af37',
              background: 'transparent',
              color: '#d4af37',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            + 追加
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: saving ? '#3a3a4a' : 'linear-gradient(135deg, #d4af37, #c9a227)',
              color: saving ? '#6a6a6a' : '#0a0a0c',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {/* メニューリスト */}
      <div
        style={{
          background: '#1c1c26',
          border: '1px solid #2a2a36',
        }}
      >
        {menu.length === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#6a6a6a',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}
          >
            メニューがありません。「+ 追加」ボタンで追加してください。
          </div>
        ) : (
          menu.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 24px',
                borderBottom: index < menu.length - 1 ? '1px solid #2a2a36' : 'none',
                opacity: item.available === false ? 0.5 : 1,
              }}
            >
              {/* 順序変更 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  style={{
                    width: '28px',
                    height: '24px',
                    border: '1px solid #3a3a4a',
                    background: index === 0 ? '#1c1c26' : '#2a2a36',
                    color: index === 0 ? '#3a3a4a' : '#9a9a9a',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                  }}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === menu.length - 1}
                  style={{
                    width: '28px',
                    height: '24px',
                    border: '1px solid #3a3a4a',
                    background: index === menu.length - 1 ? '#1c1c26' : '#2a2a36',
                    color: index === menu.length - 1 ? '#3a3a4a' : '#9a9a9a',
                    cursor: index === menu.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                  }}
                >
                  ▼
                </button>
              </div>

              {/* 商品名 */}
              <div style={{ flex: 2 }}>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#6a6a6a',
                    display: 'block',
                    marginBottom: '6px',
                    letterSpacing: '0.05em',
                  }}
                >
                  商品名
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="商品名を入力"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #3a3a4a',
                    background: '#0a0a0c',
                    color: '#f5f0e6',
                    fontSize: '14px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  }}
                />
              </div>

              {/* カテゴリ */}
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#6a6a6a',
                    display: 'block',
                    marginBottom: '6px',
                    letterSpacing: '0.05em',
                  }}
                >
                  カテゴリ
                </label>
                <input
                  type="text"
                  value={item.category || ''}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  placeholder="カテゴリ"
                  list={`categories-${index}`}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #3a3a4a',
                    background: '#0a0a0c',
                    color: '#f5f0e6',
                    fontSize: '14px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  }}
                />
                <datalist id={`categories-${index}`}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* 価格 */}
              <div style={{ width: '100px' }}>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#6a6a6a',
                    display: 'block',
                    marginBottom: '6px',
                    letterSpacing: '0.05em',
                  }}
                >
                  価格
                </label>
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #3a3a4a',
                    background: '#0a0a0c',
                    color: '#f5f0e6',
                    fontSize: '14px',
                    textAlign: 'right',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  }}
                />
              </div>

              {/* 提供可否 */}
              <div style={{ width: '80px', textAlign: 'center' }}>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#6a6a6a',
                    display: 'block',
                    marginBottom: '6px',
                    letterSpacing: '0.05em',
                  }}
                >
                  提供
                </label>
                <button
                  onClick={() => updateItem(index, 'available', !item.available)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid',
                    borderColor: item.available !== false ? '#d4af37' : '#3a3a4a',
                    background: item.available !== false ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    color: item.available !== false ? '#d4af37' : '#6a6a6a',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  }}
                >
                  {item.available !== false ? '可' : '停止'}
                </button>
              </div>

              {/* 削除 */}
              <button
                onClick={() => removeItem(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid #3a3a4a',
                  background: 'transparent',
                  color: '#e63946',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* 注意書き */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px 20px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          fontSize: '13px',
          color: '#d4af37',
          fontFamily: "'Zen Kaku Gothic New', sans-serif",
        }}
      >
        <strong>注意:</strong> 保存するとお客様の注文画面に即時反映されます。
      </div>
    </div>
  );
}
