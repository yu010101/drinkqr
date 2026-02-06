'use client';

import Link from 'next/link';
import { PLANS } from '@/lib/plans';

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0c 0%, #12121a 50%, #1a1a24 100%)',
        color: '#f5f0e6',
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 10, 12, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <div
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#d4af37',
          }}
        >
          DrinkQR
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              color: '#9a9a9a',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #d4af37, #c9a227)',
              color: '#0a0a0c',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
        }}
      >
        {/* Decorative lines */}
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(180deg, transparent, #d4af37 50%, transparent)',
            opacity: 0.2,
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
            opacity: 0.2,
          }}
        />

        <div
          style={{
            fontSize: '13px',
            color: '#d4af37',
            letterSpacing: '0.3em',
            marginBottom: '16px',
          }}
        >
          飲食店向けQRオーダーシステム
        </div>
        <h1
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 600,
            margin: '0 0 24px',
            lineHeight: 1.3,
          }}
        >
          QRコードで
          <br />
          <span style={{ color: '#d4af37' }}>注文を自動化</span>
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#9a9a9a',
            maxWidth: '500px',
            lineHeight: 1.8,
            marginBottom: '40px',
          }}
        >
          お客様がスマートフォンでQRコードを読み取り、
          そのまま注文。スタッフの負担を軽減し、
          回転率アップに貢献します。
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/signup"
            style={{
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #d4af37, #c9a227)',
              color: '#0a0a0c',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              display: 'inline-block',
            }}
          >
            14日間無料で試す
          </Link>
          <Link
            href="/manual"
            style={{
              padding: '16px 40px',
              background: 'transparent',
              border: '1px solid #3a3a4a',
              color: '#9a9a9a',
              textDecoration: 'none',
              fontSize: '16px',
              display: 'inline-block',
            }}
          >
            詳しく見る
          </Link>
        </div>

        <div
          style={{
            marginTop: '60px',
            padding: '16px 32px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'inline-block',
          }}
        >
          <span style={{ color: '#e63946', fontWeight: 600 }}>創業メンバー募集中</span>
          <span style={{ color: '#9a9a9a', marginLeft: '12px' }}>
            先着10店舗限定 スタンダードプラン永久¥1,980/月
          </span>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '28px',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          <span style={{ color: '#d4af37' }}>DrinkQR</span>の特徴
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {[
            {
              title: 'QRコードで即注文',
              desc: 'テーブルのQRコードを読み取るだけ。アプリのダウンロード不要で、すぐに注文開始。',
              icon: '📱',
            },
            {
              title: 'リアルタイム通知',
              desc: '注文が入ると管理画面にリアルタイムで通知。見逃しを防ぎます。',
              icon: '🔔',
            },
            {
              title: '自動印刷連携',
              desc: 'レシートプリンターと連携して、注文を自動で印刷。キッチンへの伝達もスムーズ。',
              icon: '🖨️',
            },
            {
              title: '売上レポート',
              desc: '日別・メニュー別の売上を自動集計。人気メニューのランキングも一目で確認。',
              icon: '📊',
            },
            {
              title: 'かんたん設定',
              desc: 'メニュー登録からQRコード印刷まで、わかりやすい管理画面で簡単に設定。',
              icon: '⚙️',
            },
            {
              title: '月額固定',
              desc: '注文数による従量課金なし。月額固定で安心してご利用いただけます。',
              icon: '💰',
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                padding: '32px',
                background: '#1c1c26',
                border: '1px solid #2a2a36',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: '#f5f0e6',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#9a9a9a', lineHeight: 1.7, margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        style={{
          padding: '80px 24px',
          background: '#12121a',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '28px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            料金プラン
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#9a9a9a',
              marginBottom: '60px',
            }}
          >
            すべてのプランに14日間の無料トライアル付き
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            {(['starter', 'standard', 'pro'] as const).map((planId) => {
              const plan = PLANS[planId];
              const isPopular = planId === 'standard';
              return (
                <div
                  key={planId}
                  style={{
                    padding: '32px',
                    background: '#1c1c26',
                    border: isPopular ? '2px solid #d4af37' : '1px solid #2a2a36',
                    position: 'relative',
                  }}
                >
                  {isPopular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#d4af37',
                        color: '#0a0a0c',
                        padding: '4px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      人気
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#9a9a9a',
                      marginBottom: '8px',
                    }}
                  >
                    {plan.name}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 700, color: '#d4af37' }}>
                      {plan.priceDisplay}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6a6a6a' }}>/月</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#9a9a9a', marginBottom: '24px' }}>
                    {plan.description}
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 24px',
                    }}
                  >
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '13px',
                          color: '#9a9a9a',
                          marginBottom: '8px',
                          paddingLeft: '20px',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#d4af37',
                          }}
                        >
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px',
                      background: isPopular
                        ? 'linear-gradient(135deg, #d4af37, #c9a227)'
                        : 'transparent',
                      border: isPopular ? 'none' : '1px solid #3a3a4a',
                      color: isPopular ? '#0a0a0c' : '#9a9a9a',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isPopular ? 600 : 400,
                    }}
                  >
                    無料で始める
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Founding member banner */}
          <div
            style={{
              marginTop: '40px',
              padding: '24px',
              background: 'rgba(230, 57, 70, 0.1)',
              border: '1px solid rgba(230, 57, 70, 0.3)',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '40px auto 0',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e63946', marginBottom: '8px' }}>
              創業メンバー特典
            </div>
            <div style={{ fontSize: '14px', color: '#9a9a9a' }}>
              先着10店舗限定で、スタンダードプランを永久<span style={{ color: '#e63946', fontWeight: 600 }}>¥1,980/月</span>でご利用いただけます。
              通常価格¥4,980のところ、60%OFF。
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '28px',
            marginBottom: '16px',
          }}
        >
          今すぐ始めましょう
        </h2>
        <p style={{ color: '#9a9a9a', marginBottom: '32px' }}>
          14日間の無料トライアル。クレジットカード不要で今すぐお試し。
        </p>
        <Link
          href="/signup"
          style={{
            display: 'inline-block',
            padding: '18px 48px',
            background: 'linear-gradient(135deg, #d4af37, #c9a227)',
            color: '#0a0a0c',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          無料でアカウント作成
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid #2a2a36',
          background: '#0a0a0c',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '18px',
              color: '#d4af37',
            }}
          >
            DrinkQR
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link href="/terms" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
              利用規約
            </Link>
            <Link href="/privacy" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
              プライバシーポリシー
            </Link>
            <Link href="/manual" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
              マニュアル
            </Link>
          </div>
          <div style={{ color: '#4a4a4a', fontSize: '12px' }}>
            © 2025 DrinkQR
          </div>
        </div>
      </footer>
    </div>
  );
}
