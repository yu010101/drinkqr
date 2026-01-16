'use client';

import { useEffect, useState } from 'react';

interface MenuItem {
  name: string;
  price?: number;
  category?: string;
}

export default function MenuEditPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // メニュー取得
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

  // メニュー保存
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
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '保存に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // アイテム更新
  const updateItem = (index: number, field: keyof MenuItem, value: string | number) => {
    const newMenu = [...menu];
    newMenu[index] = { ...newMenu[index], [field]: value };
    setMenu(newMenu);
  };

  // アイテム追加
  const addItem = () => {
    setMenu([...menu, { name: '', price: 0, category: '' }]);
  };

  // アイテム削除
  const removeItem = (index: number) => {
    if (confirm('このアイテムを削除しますか？')) {
      setMenu(menu.filter((_, i) => i !== index));
    }
  };

  // 順序変更
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...menu];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menu.length) return;
    [newMenu[index], newMenu[targetIndex]] = [newMenu[targetIndex], newMenu[index]];
    setMenu(newMenu);
  };

  // カテゴリ一覧
  const categories = [...new Set(menu.map((item) => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>メニュー編集</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {message && (
            <span
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
              }}
            >
              {message.text}
            </span>
          )}
          <button
            onClick={addItem}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#28a745',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + 追加
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: saving ? '#ccc' : '#007bff',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        {menu.length} 件のメニュー
      </div>

      {/* メニューリスト */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {menu.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            メニューがありません。「+ 追加」ボタンで追加してください。
          </div>
        ) : (
          menu.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                borderBottom: index < menu.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              {/* 順序変更ボタン */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  style={{
                    width: '24px',
                    height: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: index === 0 ? '#f5f5f5' : 'white',
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
                    width: '24px',
                    height: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: index === menu.length - 1 ? '#f5f5f5' : 'white',
                    cursor: index === menu.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                  }}
                >
                  ▼
                </button>
              </div>

              {/* 商品名 */}
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  商品名
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="商品名を入力"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* カテゴリ */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
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
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
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
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  価格
                </label>
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                  min={0}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    textAlign: 'right',
                  }}
                />
              </div>

              {/* 削除ボタン */}
              <button
                onClick={() => removeItem(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  cursor: 'pointer',
                  fontSize: '16px',
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
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#856404',
        }}
      >
        <strong>注意:</strong> メニューを保存すると、すぐにお客様の画面に反映されます。
        本番環境で保存する場合は、Vercelへの再デプロイが必要です。
      </div>
    </div>
  );
}
