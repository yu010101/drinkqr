'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/auth-client';
import type { Store } from '@/lib/auth-client';
import { PLANS, type PlanId } from '@/lib/plans';

interface FoundingStatus {
  available: boolean;
  remaining: number;
  total: number;
}

function PlanCard({
  planId,
  isSelected,
  onSelect,
  foundingStatus,
  currentPlan,
}: {
  planId: PlanId;
  isSelected: boolean;
  onSelect: (id: PlanId) => void;
  foundingStatus: FoundingStatus | null;
  currentPlan: string | null;
}) {
  const plan = PLANS[planId];
  const isFoundingPlan = planId === 'standard_founding';
  const isFoundingAvailable = foundingStatus?.available ?? false;
  const isCurrentPlan = currentPlan === planId;

  // Hide founding plan if not available
  if (isFoundingPlan && !isFoundingAvailable && !isCurrentPlan) {
    return null;
  }

  const isDisabled = isFoundingPlan && !isFoundingAvailable && !isCurrentPlan;

  return (
    <div
      onClick={() => !isDisabled && !isCurrentPlan && onSelect(planId)}
      style={{
        flex: 1,
        minWidth: '200px',
        padding: '24px',
        background: isSelected ? 'rgba(212, 175, 55, 0.1)' : '#0a0a0c',
        border: `2px solid ${isSelected ? '#d4af37' : isFoundingPlan ? '#e63946' : '#2a2a36'}`,
        cursor: isDisabled || isCurrentPlan ? 'default' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      {/* Badge */}
      {isFoundingPlan && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#e63946',
            color: '#fff',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {foundingStatus ? `残り${foundingStatus.remaining}枠` : '創業メンバー限定'}
        </div>
      )}

      {isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '12px',
            background: '#4caf50',
            color: '#fff',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          現在のプラン
        </div>
      )}

      {/* Plan name */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#f5f0e6',
          marginBottom: '8px',
          fontFamily: "'Shippori Mincho', serif",
        }}
      >
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ marginBottom: '12px' }}>
        {plan.originalPrice && (
          <span
            style={{
              fontSize: '14px',
              color: '#6a6a6a',
              textDecoration: 'line-through',
              marginRight: '8px',
            }}
          >
            ¥{plan.originalPrice.toLocaleString()}
          </span>
        )}
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: isFoundingPlan ? '#e63946' : '#d4af37',
          }}
        >
          {plan.priceDisplay}
        </span>
        <span style={{ fontSize: '12px', color: '#6a6a6a' }}>/月</span>
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '12px',
          color: '#9a9a9a',
          marginBottom: '16px',
        }}
      >
        {plan.description}
      </div>

      {/* Features */}
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          fontSize: '12px',
          color: '#9a9a9a',
        }}
      >
        {plan.features.map((feature, i) => (
          <li
            key={i}
            style={{
              marginBottom: '6px',
              paddingLeft: '16px',
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
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('starter');
  const [foundingStatus, setFoundingStatus] = useState<FoundingStatus | null>(null);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success) {
      setMessage({ type: 'success', text: 'サブスクリプションの登録が完了しました' });
    } else if (canceled) {
      setMessage({ type: 'error', text: 'サブスクリプションの登録がキャンセルされました' });
    }
  }, [success, canceled]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (data) {
          setStore(data);
          setFormData({ name: data.name, slug: data.slug });
        }
      }
      setLoading(false);
    };

    const fetchFoundingStatus = async () => {
      try {
        const res = await fetch('/api/plans/founding-status');
        if (res.ok) {
          const data = await res.json();
          setFoundingStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch founding status:', err);
      }
    };

    fetchData();
    fetchFoundingStatus();
  }, []);

  const handleSaveSettings = async () => {
    if (!store) return;

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from('stores')
      .update({
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id);

    if (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } else {
      setMessage({ type: 'success', text: '保存しました' });
      setStore({ ...store, name: formData.name, slug: formData.slug });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'エラーが発生しました' });
      }
    } catch {
      setMessage({ type: 'error', text: 'エラーが発生しました' });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'エラーが発生しました' });
      }
    } catch {
      setMessage({ type: 'error', text: 'エラーが発生しました' });
    }
  };

  const getSubscriptionStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return { label: '有効', color: '#4caf50' };
      case 'trialing': return { label: 'トライアル中', color: '#d4af37' };
      case 'past_due': return { label: '支払い遅延', color: '#e63946' };
      case 'canceled': return { label: '解約済み', color: '#6a6a6a' };
      default: return { label: '未登録', color: '#6a6a6a' };
    }
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return null;
    return PLANS[planId as PlanId]?.name || planId;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '60px',
          textAlign: 'center',
          color: '#6a6a6a',
          fontFamily: "'Zen Kaku Gothic New', sans-serif",
        }}
      >
        読み込み中...
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionStatusLabel(store?.subscription_status || null);
  const hasActiveSubscription = store?.subscription_status && !['canceled', null].includes(store.subscription_status);

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: '#f5f0e6',
            fontFamily: "'Shippori Mincho', serif",
          }}
        >
          設定
        </h1>
      </div>

      {message && (
        <div
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            background: message.type === 'success' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(230, 57, 70, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(230, 57, 70, 0.3)'}`,
            color: message.type === 'success' ? '#d4af37' : '#e63946',
            fontSize: '13px',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          {message.text}
        </div>
      )}

      {/* 店舗設定 */}
      <div
        style={{
          background: '#1c1c26',
          border: '1px solid #2a2a36',
          padding: '32px',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            margin: '0 0 24px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#f5f0e6',
            fontFamily: "'Shippori Mincho', serif",
          }}
        >
          店舗情報
        </h2>

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
            店舗名
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            スラッグ (URL用)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6a6a6a', fontSize: '14px' }}>/s/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              style={{
                flex: 1,
                padding: '14px 16px',
                border: '1px solid #3a3a4a',
                background: '#0a0a0c',
                color: '#f5f0e6',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
            <span style={{ color: '#6a6a6a', fontSize: '14px' }}>/t/...</span>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            padding: '14px 28px',
            border: 'none',
            background: saving ? '#3a3a4a' : 'linear-gradient(135deg, #d4af37, #c9a227)',
            color: saving ? '#6a6a6a' : '#0a0a0c',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>

      {/* サブスクリプション */}
      <div
        style={{
          background: '#1c1c26',
          border: '1px solid #2a2a36',
          padding: '32px',
        }}
      >
        <h2
          style={{
            margin: '0 0 24px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#f5f0e6',
            fontFamily: "'Shippori Mincho', serif",
          }}
        >
          サブスクリプション
        </h2>

        {/* Current Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            background: '#0a0a0c',
            border: '1px solid #2a2a36',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '4px' }}>
              現在のステータス
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: subscriptionInfo.color,
              }}
            >
              {subscriptionInfo.label}
              {store?.plan_id && (
                <span style={{ marginLeft: '12px', color: '#9a9a9a', fontWeight: 400 }}>
                  ({getPlanName(store.plan_id)})
                </span>
              )}
            </div>
            {store?.subscription_period_end && (
              <div style={{ fontSize: '12px', color: '#6a6a6a', marginTop: '4px' }}>
                次回更新: {new Date(store.subscription_period_end).toLocaleDateString('ja-JP')}
              </div>
            )}
          </div>
        </div>

        {/* Plan Selection (only show when not subscribed) */}
        {!hasActiveSubscription && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#9a9a9a', marginBottom: '16px' }}>
                プランを選択してください
              </div>

              {/* Founding Member Banner */}
              {foundingStatus?.available && (
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'rgba(230, 57, 70, 0.1)',
                    border: '1px solid rgba(230, 57, 70, 0.3)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e63946' }}>
                      創業メンバー特典実施中！
                    </div>
                    <div style={{ fontSize: '12px', color: '#9a9a9a' }}>
                      先着{foundingStatus.total}店舗限定でスタンダードプランが永久¥1,980/月
                      <span style={{ marginLeft: '8px', color: '#e63946', fontWeight: 600 }}>
                        残り{foundingStatus.remaining}枠
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Cards */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <PlanCard
                  planId="starter"
                  isSelected={selectedPlan === 'starter'}
                  onSelect={setSelectedPlan}
                  foundingStatus={foundingStatus}
                  currentPlan={store?.plan_id || null}
                />
                {foundingStatus?.available && (
                  <PlanCard
                    planId="standard_founding"
                    isSelected={selectedPlan === 'standard_founding'}
                    onSelect={setSelectedPlan}
                    foundingStatus={foundingStatus}
                    currentPlan={store?.plan_id || null}
                  />
                )}
                <PlanCard
                  planId="standard"
                  isSelected={selectedPlan === 'standard'}
                  onSelect={setSelectedPlan}
                  foundingStatus={foundingStatus}
                  currentPlan={store?.plan_id || null}
                />
                <PlanCard
                  planId="pro"
                  isSelected={selectedPlan === 'pro'}
                  onSelect={setSelectedPlan}
                  foundingStatus={foundingStatus}
                  currentPlan={store?.plan_id || null}
                />
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#d4af37',
              }}
            >
              14日間の無料トライアル付き。クレジットカード登録後、トライアル期間終了後に課金が開始されます。
            </div>

            <button
              onClick={handleSubscribe}
              style={{
                padding: '16px 32px',
                border: 'none',
                background: selectedPlan === 'standard_founding'
                  ? 'linear-gradient(135deg, #e63946, #c53030)'
                  : 'linear-gradient(135deg, #d4af37, #c9a227)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
              }}
            >
              {selectedPlan === 'standard_founding'
                ? '創業メンバーとして登録する'
                : `${PLANS[selectedPlan].name}プランで開始`}
            </button>
          </>
        )}

        {/* Manage Subscription (only show when subscribed) */}
        {hasActiveSubscription && (
          <button
            onClick={handleManageSubscription}
            style={{
              padding: '14px 28px',
              border: '1px solid #3a3a4a',
              background: 'transparent',
              color: '#9a9a9a',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}
          >
            支払い方法・解約を管理
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#6a6a6a' }}>読み込み中...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
