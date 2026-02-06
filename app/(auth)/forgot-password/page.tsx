'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0c',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#12121a',
          border: '1px solid #2a2a36',
          padding: '48px 40px',
        }}
      >
        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '11px',
              color: '#d4af37',
              letterSpacing: '0.3em',
              marginBottom: '8px',
            }}
          >
            DRINK QR
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              color: '#f5f0e6',
              fontFamily: "'Shippori Mincho', serif",
            }}
          >
            パスワードリセット
          </h1>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '20px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                marginBottom: '24px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#d4af37',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              >
                パスワードリセットのメールを送信しました。
                <br />
                メールをご確認ください。
              </p>
            </div>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                border: '1px solid #3a3a4a',
                background: 'transparent',
                color: '#9a9a9a',
                textDecoration: 'none',
                fontSize: '14px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
              }}
            >
              ログイン画面に戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(230, 57, 70, 0.1)',
                  border: '1px solid rgba(230, 57, 70, 0.3)',
                  color: '#e63946',
                  fontSize: '13px',
                  marginBottom: '24px',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              >
                {error}
              </div>
            )}

            <p
              style={{
                margin: '0 0 24px',
                fontSize: '13px',
                color: '#6a6a6a',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                lineHeight: 1.6,
              }}
            >
              登録したメールアドレスを入力してください。
              パスワードリセットのリンクをお送りします。
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#6a6a6a',
                  marginBottom: '8px',
                  letterSpacing: '0.05em',
                }}
              >
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #3a3a4a',
                  background: '#0a0a0c',
                  color: '#f5f0e6',
                  fontSize: '14px',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                background: loading ? '#3a3a4a' : 'linear-gradient(135deg, #d4af37, #c9a227)',
                color: loading ? '#6a6a6a' : '#0a0a0c',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                marginBottom: '24px',
              }}
            >
              {loading ? '送信中...' : 'リセットメールを送信'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="/login"
                style={{
                  color: '#6a6a6a',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              >
                ログイン画面に戻る
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
