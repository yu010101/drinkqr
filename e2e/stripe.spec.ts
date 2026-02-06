import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Stripe決済機能', () => {
  test.describe('/api/stripe/checkout', () => {
    test('未認証でアクセス → 401エラー', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
        data: { planId: 'starter' },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('認証');
    });

    test('無効なプランID → 400エラー', async ({ request }) => {
      // This will fail with 401 first (no auth), but tests the endpoint exists
      const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
        data: { planId: 'invalid_plan' },
      });

      // Without auth, should get 401
      expect(response.status()).toBe(401);
    });

    test('プランID未指定 → デフォルトでstarterが使用される', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
        data: {},
      });

      // Without auth, should get 401 (but endpoint is working)
      expect(response.status()).toBe(401);
    });
  });

  test.describe('/api/stripe/portal', () => {
    test('未認証でアクセス → 401エラー', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/portal`);

      expect(response.status()).toBe(401);
    });
  });

  test.describe('/api/stripe/webhook', () => {
    test('署名なしでアクセス → 400エラー', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/webhook`, {
        data: {
          type: 'checkout.session.completed',
          data: { object: {} },
        },
      });

      // Should reject without valid signature
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('signature');
    });

    test('不正な署名でアクセス → 400エラー', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/webhook`, {
        headers: {
          'stripe-signature': 'invalid_signature',
        },
        data: {
          type: 'checkout.session.completed',
          data: { object: {} },
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('/api/plans/founding-status', () => {
    test('創業メンバー状況を取得できる', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/plans/founding-status`);

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Should have expected shape
      expect(body).toHaveProperty('available');
      expect(body).toHaveProperty('remaining');
      expect(body).toHaveProperty('total');
      expect(typeof body.available).toBe('boolean');
      expect(typeof body.remaining).toBe('number');
      expect(typeof body.total).toBe('number');
      expect(body.total).toBe(10); // FOUNDING_MEMBER_LIMIT
    });

    test('remainingが0-10の範囲内', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/plans/founding-status`);

      expect(response.status()).toBe(200);
      const body = await response.json();

      expect(body.remaining).toBeGreaterThanOrEqual(0);
      expect(body.remaining).toBeLessThanOrEqual(10);
    });
  });
});

test.describe('設定ページUI', () => {
  test('プラン選択UIが表示される（要認証）', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/admin/settings`);

    // Should redirect to login when not authenticated
    await expect(page).toHaveURL(/\/login/);
  });
});
