'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = tableName.trim();

    if (!trimmed) {
      setError('テーブル番号を入力してください');
      return;
    }

    if (trimmed.length > 10) {
      setError('テーブル番号は10文字以内で入力してください');
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      setError('テーブル番号は英数字のみ使用できます');
      return;
    }

    router.push(`/t/${trimmed}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
          QRコードが読み取れない場合
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value.toUpperCase())}
            placeholder="テーブル番号を入力"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '15px',
              boxSizing: 'border-box',
            }}
            maxLength={10}
          />

          {error && (
            <div
              style={{
                color: '#dc3545',
                marginBottom: '15px',
                fontSize: '14px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                borderRadius: '6px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            メニューを開く
          </button>
        </form>
      </div>
    </div>
  );
}
