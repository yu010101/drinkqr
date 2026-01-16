'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: '注文一覧', icon: '📋' },
    { href: '/admin/print-jobs', label: '印刷状況', icon: '🖨️' },
    { href: '/admin/menu', label: 'メニュー編集', icon: '🍺' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* サイドバー */}
      <nav
        style={{
          width: '220px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: '20px 0',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '0 20px 20px',
            borderBottom: '1px solid #333',
            marginBottom: '20px',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            DrinkQR
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>
            管理画面
          </p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    color: isActive ? 'white' : '#aaa',
                    backgroundColor: isActive ? '#007bff' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#333',
              color: '#888',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            ← 注文画面に戻る
          </Link>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main
        style={{
          flex: 1,
          backgroundColor: '#f5f5f5',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
