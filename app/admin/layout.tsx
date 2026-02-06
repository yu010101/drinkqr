'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth-client';
import type { Store } from '@/lib/auth-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        setStore(data);
      }
      setLoading(false);
    };

    fetchStore();
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', label: '注文一覧' },
    { href: '/admin/print-jobs', label: '印刷状況' },
    { href: '/admin/menu', label: 'メニュー編集' },
    { href: '/admin/qr', label: 'QRコード' },
    { href: '/admin/reports', label: '売上レポート' },
    { href: '/admin/settings', label: '設定' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#12121a' }}>
      {/* サイドバー */}
      <nav
        style={{
          width: '240px',
          background: '#0a0a0c',
          borderRight: '1px solid #2a2a36',
          padding: '24px 0',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ロゴ */}
        <div
          style={{
            padding: '0 24px 24px',
            borderBottom: '1px solid #2a2a36',
          }}
        >
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '11px',
              color: '#d4af37',
              letterSpacing: '0.2em',
              marginBottom: '4px',
            }}
          >
            DRINK QR
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#f5f0e6',
              fontFamily: "'Shippori Mincho', serif",
            }}
          >
            管理画面
          </h1>
        </div>

        {/* 店舗情報 */}
        {store && (
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #2a2a36',
            }}
          >
            <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '6px' }}>
              店舗
            </div>
            <div style={{ fontSize: '14px', color: '#f5f0e6', fontWeight: 500 }}>
              {store.name}
            </div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                background: '#1c1c26',
                border: '1px solid #2a2a36',
                fontSize: '11px',
                color: '#6a6a6a',
                fontFamily: 'monospace',
              }}
            >
              /{store.slug}
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <ul style={{ listStyle: 'none', padding: '20px 0', margin: 0, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '14px 24px',
                    color: isActive ? '#d4af37' : '#9a9a9a',
                    background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 下部 */}
        <div style={{ padding: '0 16px' }}>
          <Link
            href={store ? `/s/${store.slug}/t/A1` : '/'}
            target="_blank"
            style={{
              display: 'block',
              padding: '12px 16px',
              background: '#1c1c26',
              border: '1px solid #2a2a36',
              color: '#9a9a9a',
              textDecoration: 'none',
              fontSize: '12px',
              textAlign: 'center',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
          >
            注文画面をプレビュー
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid #3a3a4a',
              color: '#6a6a6a',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}
          >
            ログアウト
          </button>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
