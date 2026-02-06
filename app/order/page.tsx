'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderEntryPage() {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

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
        padding: '24px',
        background: 'linear-gradient(180deg, #0a0a0c 0%, #12121a 50%, #1a1a24 100%)',
        position: 'relative',
      }}
    >
      {/* 装飾：縦線 */}
      <div
        style={{
          position: 'absolute',
          left: '10%',
          top: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(180deg, transparent, #d4af37 50%, transparent)',
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '10%',
          top: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(180deg, transparent, #d4af37 50%, transparent)',
          opacity: 0.3,
        }}
      />

      {/* メインカード */}
      <div
        style={{
          background: '#1c1c26',
          border: '2px solid #d4af37',
          padding: '48px 32px',
          maxWidth: '380px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* 角の装飾 */}
        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #d4af37', borderRight: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #d4af37', borderRight: '4px solid #d4af37' }} />

        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '13px',
              color: '#d4af37',
              letterSpacing: '0.3em',
              marginBottom: '8px',
            }}
          >
            飲み放題
          </div>
          <h1
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#f5f0e6',
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            QR注文
          </h1>
        </div>

        {/* 説明 */}
        <p
          style={{
            margin: '0 0 28px',
            color: '#9a9a9a',
            fontSize: '13px',
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          QRコードが読み取れない場合は
          <br />
          下記よりテーブル番号を入力してください
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toUpperCase())}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="例：A1"
              style={{
                width: '100%',
                padding: '18px 20px',
                fontSize: '20px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontWeight: 700,
                background: '#0a0a0c',
                border: `2px solid ${isFocused ? '#d4af37' : '#3a3a4a'}`,
                color: '#f5f0e6',
                textAlign: 'center',
                letterSpacing: '0.2em',
                transition: 'border-color 0.2s',
                outline: 'none',
              }}
              maxLength={10}
            />
          </div>

          {error && (
            <div
              style={{
                color: '#e63946',
                marginBottom: '20px',
                fontSize: '13px',
                padding: '14px',
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.3)',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '16px',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontWeight: 700,
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#0a0a0c',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.15em',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            メニューを開く
          </button>
        </form>
      </div>

      {/* フッター装飾 */}
      <div
        style={{
          marginTop: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: '#5a5a5a',
          fontSize: '11px',
          letterSpacing: '0.1em',
        }}
      >
        <span style={{ width: '40px', height: '1px', background: '#3a3a4a' }} />
        <span>DRINK QR</span>
        <span style={{ width: '40px', height: '1px', background: '#3a3a4a' }} />
      </div>
    </div>
  );
}
