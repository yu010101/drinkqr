'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    if (storeName.trim().length < 2) {
      setError('店舗名は2文字以上で入力してください');
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            store_name: storeName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        // 店舗を作成
        const slug = storeName
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 30) + '-' + Math.random().toString(36).substring(2, 8);

        const { error: storeError } = await supabase.from('stores').insert({
          name: storeName.trim(),
          owner_id: authData.user.id,
          slug,
        });

        if (storeError) {
          console.error('Store creation error:', storeError);
          // 店舗作成に失敗してもユーザーは作成されているので、後で作成できるようにする
        }

        setSuccess(true);
      }
    } catch (err) {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              border: '3px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px',
              color: '#d4af37',
            }}
          >
            <span style={{ fontFamily: "'Shippori Mincho', serif" }}>完</span>
          </div>
          <h2
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '22px',
              color: '#f5f0e6',
              margin: '0 0 16px',
            }}
          >
            登録完了
          </h2>
          <p style={{ color: '#9a9a9a', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
            確認メールを送信しました。
            <br />
            メール内のリンクをクリックして
            <br />
            登録を完了してください。
          </p>
          <Link
            href="/login"
            style={{
              display: 'block',
              padding: '16px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#0a0a0c',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
            }}
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

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
            新規登録
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#9a9a9a',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              店舗名
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              placeholder="例：居酒屋 たなか"
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

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#9a9a9a',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              パスワード（6文字以上）
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

          <div style={{ marginBottom: '32px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#9a9a9a',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? '登録中...' : '無料で始める'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            fontSize: '12px',
            color: '#c9b896',
            textAlign: 'center',
          }}
        >
          登録後、すぐにご利用いただけます
        </div>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#6a6a6a',
          }}
        >
          既にアカウントをお持ちの方は
          <Link
            href="/login"
            style={{
              color: '#d4af37',
              marginLeft: '8px',
              textDecoration: 'none',
            }}
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
