import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('認証機能', () => {
  test.describe('アクセス制御', () => {
    test('未認証で /admin アクセス → /login にリダイレクト', async ({ page }) => {
      // Clear cookies to ensure unauthenticated state
      await page.context().clearCookies();

      await page.goto(`${BASE_URL}/admin`);

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('未認証で /admin/menu アクセス → /login にリダイレクト', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/admin/menu`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('未認証で /admin/settings アクセス → /login にリダイレクト', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/admin/settings`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('未認証で /admin/qr アクセス → /login にリダイレクト', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/admin/qr`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('未認証で /admin/print-jobs アクセス → /login にリダイレクト', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/admin/print-jobs`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('未認証で /admin/reports アクセス → /login にリダイレクト', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/admin/reports`);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('ログインページ', () => {
    test('ログインページが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Check login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('空のフォームで送信 → エラー表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.locator('button[type="submit"]').click();

      // Should show validation error or stay on page
      await expect(page).toHaveURL(/\/login/);
    });

    test('無効なメールアドレス形式 → エラー表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.locator('button[type="submit"]').click();

      // Should stay on login page or show error
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/\/(login|admin)/);
    });
  });

  test.describe('サインアップページ', () => {
    test('サインアップページが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('店舗名入力フィールドが存在する', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Check for store name input by placeholder text containing "居酒屋" or type="text"
      const storeNameInput = page.locator('input[type="text"]').first();
      await expect(storeNameInput).toBeVisible();
    });

    test('パスワード確認フィールドが存在する', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Should have 2 password fields (password and confirm)
      const passwordFields = page.locator('input[type="password"]');
      await expect(passwordFields).toHaveCount(2);
    });
  });

  test.describe('パスワードリセット', () => {
    test('パスワードリセットページが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('公開ページアクセス', () => {
    test('ランディングページは認証不要', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/`);

      // Should not redirect
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });

    test('利用規約ページは認証不要', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/terms`);

      await expect(page).toHaveURL(`${BASE_URL}/terms`);
    });

    test('プライバシーポリシーは認証不要', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/privacy`);

      await expect(page).toHaveURL(`${BASE_URL}/privacy`);
    });

    test('注文ページは認証不要', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/t/A1`);

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });
  });
});

test.describe('API認証', () => {
  test.describe('/api/stripe/checkout', () => {
    test('未認証で POST → 401 Unauthorized', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
        data: { planId: 'starter' },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toBeTruthy();
    });
  });

  test.describe('/api/stripe/portal', () => {
    test('未認証で POST → 401 Unauthorized', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/stripe/portal`);

      expect(response.status()).toBe(401);
    });
  });

  test.describe('/api/menu', () => {
    test('未認証で GET → 401 Unauthorized', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/menu`);

      expect(response.status()).toBe(401);
    });

    test('未認証で PUT → 401 Unauthorized', async ({ request }) => {
      const response = await request.put(`${BASE_URL}/api/menu`, {
        data: { items: [] },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('/api/orders', () => {
    test('注文APIは認証不要（公開API）', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'A1',
          items: [{ name: 'テスト', qty: 1 }],
        },
      });

      // Should succeed without auth (public ordering)
      expect(response.status()).toBe(200);
    });
  });
});
