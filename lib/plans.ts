export type PlanId = 'starter' | 'standard' | 'standard_founding' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  nameEn: string;
  price: number;
  priceDisplay: string;
  originalPrice?: number;
  description: string;
  features: string[];
  limits: {
    tables: number;
    menuItems: number;
    orderHistoryDays: number;
  };
  badge?: string;
  maxSubscribers?: number;
  stripePriceId: string;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: 'starter',
    name: 'スターター',
    nameEn: 'Starter',
    price: 1980,
    priceDisplay: '¥1,980',
    description: '小規模店舗向け',
    features: [
      'テーブル5卓まで',
      'メニュー30件まで',
      '注文履歴7日間保存',
      'メールサポート',
    ],
    limits: {
      tables: 5,
      menuItems: 30,
      orderHistoryDays: 7,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '',
  },
  standard: {
    id: 'standard',
    name: 'スタンダード',
    nameEn: 'Standard',
    price: 4980,
    priceDisplay: '¥4,980',
    description: '中規模店舗向け',
    features: [
      'テーブル20卓まで',
      'メニュー100件まで',
      '注文履歴60日間保存',
      'チャットサポート',
      '印刷連携',
    ],
    limits: {
      tables: 20,
      menuItems: 100,
      orderHistoryDays: 60,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || '',
  },
  standard_founding: {
    id: 'standard_founding',
    name: 'スタンダード（創業メンバー）',
    nameEn: 'Standard (Founding)',
    price: 1980,
    priceDisplay: '¥1,980',
    originalPrice: 4980,
    description: '先着10店舗限定・永久割引',
    features: [
      'テーブル20卓まで',
      'メニュー100件まで',
      '注文履歴60日間保存',
      'チャットサポート',
      '印刷連携',
      '永久割引価格',
    ],
    limits: {
      tables: 20,
      menuItems: 100,
      orderHistoryDays: 60,
    },
    badge: '創業メンバー限定',
    maxSubscribers: 10,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_FOUNDING || '',
  },
  pro: {
    id: 'pro',
    name: 'プロ',
    nameEn: 'Pro',
    price: 9980,
    priceDisplay: '¥9,980',
    description: '大規模店舗・複数店舗向け',
    features: [
      'テーブル無制限',
      'メニュー無制限',
      '注文履歴1年間保存',
      '電話サポート',
      '印刷連携',
      '売上分析',
      'API連携',
    ],
    limits: {
      tables: -1, // unlimited
      menuItems: -1,
      orderHistoryDays: 365,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
  },
};

export const FOUNDING_MEMBER_LIMIT = 10;

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

export function getPublicPlans(): Plan[] {
  // standard_founding is only shown when slots are available
  return [PLANS.starter, PLANS.standard, PLANS.pro];
}
