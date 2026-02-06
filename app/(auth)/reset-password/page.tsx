'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the email link
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No valid session, the link may have expired
        setError('リンクが無効または期限切れです。再度パスワードリセットを申請してください。');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
            新しいパスワード
          </h1>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '20px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
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
                パスワードを変更しました。
                <br />
                ログイン画面に移動します...
              </p>
            </div>
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

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#6a6a6a',
                  marginBottom: '8px',
                  letterSpacing: '0.05em',
                }}
              >
                新しいパスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
                パスワード確認
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
              }}
            >
              {loading ? '変更中...' : 'パスワードを変更'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
