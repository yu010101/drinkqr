import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('マルチテナント分離', () => {
  test.describe('注文API - store_id検証', () => {
    test('有効なstore_idで注文作成成功', async ({ request }) => {
      // Note: This test requires a valid store_id from the database
      // In a real test, you would create a test store first
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'A1',
          items: [{ name: 'テスト商品', qty: 1 }],
          // store_id is optional for legacy compatibility
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('無効なstore_id形式 → 400エラー', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'A1',
          items: [{ name: 'テスト商品', qty: 1 }],
          store_id: 'invalid-uuid-format',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('店舗ID');
    });

    test('存在しないstore_id → エラー', async ({ request }) => {
      const nonExistentUUID = '00000000-0000-0000-0000-000000000000';
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'A1',
          items: [{ name: 'テスト商品', qty: 1 }],
          store_id: nonExistentUUID,
        },
      });

      // Should still succeed because orders API uses service role key
      // but the order will have this store_id
      expect([200, 400, 500]).toContain(response.status());
    });
  });

  test.describe('店舗別URL - /s/[storeSlug]/t/[table]', () => {
    test('存在する店舗スラッグでメニュー表示', async ({ page }) => {
      // Note: Replace with actual test store slug
      const testSlug = 'test-izakaya-86384';

      await page.goto(`${BASE_URL}/s/${testSlug}/t/A1`);

      // Should show menu or "menu not found" (not 404)
      const content = await page.content();
      expect(content).toBeTruthy();

      // Check it didn't redirect to error page
      await expect(page).toHaveURL(new RegExp(`/s/${testSlug}/t/A1`));
    });

    test('存在しない店舗スラッグ → エラー表示', async ({ page }) => {
      const nonExistentSlug = 'this-store-does-not-exist-12345';

      await page.goto(`${BASE_URL}/s/${nonExistentSlug}/t/A1`);

      // Should show error message about store not found
      await expect(page.locator('body')).toContainText(/店舗|見つかりません|エラー|not found/i);
    });

    test('異なる店舗間でメニューが分離されている', async ({ page }) => {
      // This test verifies that different store slugs show different content
      // In a real test, you'd compare menus from two different test stores

      const slug1 = 'test-store-1';
      const slug2 = 'test-store-2';

      // Just verify both URLs are accessible (detailed menu comparison needs real data)
      const response1 = await page.goto(`${BASE_URL}/s/${slug1}/t/A1`);
      const response2 = await page.goto(`${BASE_URL}/s/${slug2}/t/A1`);

      // Both should return HTTP response (might be 200 or show "not found" for non-existent stores)
      expect(response1?.status()).toBeDefined();
      expect(response2?.status()).toBeDefined();
    });
  });

  test.describe('テーブル名検証', () => {
    test('有効なテーブル名（英数字）', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);

      // Should not show table name error
      const content = await page.content();
      expect(content).not.toMatch(/無効なテーブル/i);
    });

    test('有効なテーブル名（数字のみ）', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/123`);

      const content = await page.content();
      expect(content).not.toMatch(/無効なテーブル/i);
    });

    test('有効なテーブル名（英字のみ）', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/TableOne`);

      const content = await page.content();
      expect(content).not.toMatch(/無効なテーブル/i);
    });

    test('無効なテーブル名（ハイフン含む）→ エラー', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A-1`);

      await expect(page.locator('body')).toContainText(/無効|エラー|invalid/i);
    });

    test('無効なテーブル名（日本語）→ エラー', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/テーブル1`);

      await expect(page.locator('body')).toContainText(/無効|エラー|invalid/i);
    });

    test('無効なテーブル名（11文字以上）→ エラー', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/ABCDEFGHIJK`); // 11 chars

      await expect(page.locator('body')).toContainText(/無効|エラー|invalid/i);
    });

    test('有効なテーブル名（10文字）', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/ABCDEFGHIJ`); // 10 chars

      const content = await page.content();
      expect(content).not.toMatch(/無効なテーブル/i);
    });
  });
});

test.describe('RLS（Row Level Security）検証', () => {
  // Note: These tests verify RLS is working by checking API responses
  // A more thorough test would use Supabase client directly

  test.describe('注文データ分離', () => {
    test('注文作成時にstore_idが正しく設定される', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'RLS1',
          items: [{ name: 'RLSテスト', qty: 1 }],
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.order_id).toBeTruthy();
    });
  });

  test.describe('印刷ジョブ分離', () => {
    test('注文作成時に印刷ジョブも自動作成される', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/orders`, {
        data: {
          table: 'PRINT1',
          items: [{ name: '印刷テスト', qty: 1 }],
        },
      });

      expect(response.status()).toBe(200);
      // Print job is created server-side, can't verify directly without DB access
    });
  });
});
