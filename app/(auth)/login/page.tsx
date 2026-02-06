'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <div
        style={{
          background: '#1c1c26',
          border: '2px solid #d4af37',
          padding: '48px 40px',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* 角の装飾 */}
        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #d4af37', borderRight: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #d4af37', borderLeft: '4px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #d4af37', borderRight: '4px solid #d4af37' }} />

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '12px',
              color: '#d4af37',
              letterSpacing: '0.3em',
              marginBottom: '8px',
            }}
          >
            DRINK QR
          </div>
          <h1
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '26px',
              fontWeight: 600,
              color: '#f5f0e6',
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            ログイン
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#9a9a9a',
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
                padding: '16px',
                fontSize: '15px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                background: '#0a0a0c',
                border: '1px solid #3a3a4a',
                color: '#f5f0e6',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#d4af37')}
              onBlur={(e) => (e.target.style.borderColor = '#3a3a4a')}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#9a9a9a',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                background: '#0a0a0c',
                border: '1px solid #3a3a4a',
                color: '#f5f0e6',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#d4af37')}
              onBlur={(e) => (e.target.style.borderColor = '#3a3a4a')}
            />
          </div>

          <div style={{ marginBottom: '32px', textAlign: 'right' }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: '12px',
                color: '#6a6a6a',
                textDecoration: 'none',
              }}
            >
              パスワードを忘れた方
            </Link>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '14px',
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.3)',
                color: '#e63946',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '16px',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontWeight: 700,
              background: loading ? '#3a3a4a' : 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: loading ? '#6a6a6a' : '#0a0a0c',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.15em',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#6a6a6a',
          }}
        >
          アカウントをお持ちでない方は
          <Link
            href="/signup"
            style={{
              color: '#d4af37',
              marginLeft: '8px',
              textDecoration: 'none',
            }}
          >
            新規登録
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: '#4a4a4a',
          fontSize: '11px',
        }}
      >
        <span style={{ width: '40px', height: '1px', background: '#3a3a4a' }} />
        <span>店舗管理者専用</span>
        <span style={{ width: '40px', height: '1px', background: '#3a3a4a' }} />
      </div>
    </div>
  );
}
