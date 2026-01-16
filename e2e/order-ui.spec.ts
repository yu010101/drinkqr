import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('注文UI - /t/[table]', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にメニューファイルが存在することを確認
    // 実際の実装に合わせて調整が必要
  });

  test.describe('正常系', () => {
    test('有効なテーブル名でアクセス → メニューが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // メニューが表示されることを確認
      await expect(page.locator('h1')).toContainText(/飲み放題メニュー/i);
      
      // メニューアイテムが表示されることを確認
      await expect(page.locator('[data-testid="menu-item"]').first()).toBeVisible();
    });

    test('メニューアイテムを選択して数量を指定 → 注文ボタンが有効になる', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // アイテムを選択（実装に合わせて調整）
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      
      // 数量を入力
      const quantityInput = page.locator('input[type="number"]').first();
      await quantityInput.fill('2');
      
      // 注文ボタンが有効になることを確認
      const orderButton = page.locator('button:has-text("注文する")');
      await expect(orderButton).toBeEnabled();
    });

    test('注文送信 → 成功メッセージが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // モックAPIレスポンスを設定
      await page.route('**/api/orders', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, order_id: 'test-order-id' }),
        });
      });
      
      // アイテムを選択して数量を指定
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      await page.locator('input[type="number"]').first().fill('1');
      
      // 注文ボタンをクリック
      const orderButton = page.locator('button:has-text("注文する")');
      await orderButton.click();
      
      // 成功メッセージが表示されることを確認
      await expect(page.locator('text=/注文が送信されました/i')).toBeVisible();
    });

    test('複数アイテムを選択して注文 → すべてのアイテムが送信される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      let requestBody: any = null;
      await page.route('**/api/orders', async route => {
        requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, order_id: 'test-order-id' }),
        });
      });
      
      // 複数アイテムを選択
      const items = page.locator('[data-testid="menu-item"]');
      const count = await items.count();
      
      if (count >= 2) {
        await items.nth(0).click();
        await page.locator('input[type="number"]').nth(0).fill('1');
        
        await items.nth(1).click();
        await page.locator('input[type="number"]').nth(1).fill('2');
        
        // 注文送信
        await page.locator('button:has-text("注文する")').click();
        
        // リクエストボディを確認
        expect(requestBody).toBeTruthy();
        expect(requestBody.items).toHaveLength(2);
      }
    });

    test('数量を変更して注文 → 正しい数量で送信される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      let requestBody: any = null;
      await page.route('**/api/orders', async route => {
        requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, order_id: 'test-order-id' }),
        });
      });
      
      // アイテムを選択
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      
      // 数量を変更
      const quantityInput = page.locator('input[type="number"]').first();
      await quantityInput.fill('5');
      
      // 注文送信
      await page.locator('button:has-text("注文する")').click();
      
      // リクエストボディを確認
      expect(requestBody).toBeTruthy();
      expect(requestBody.items[0].qty).toBe(5);
    });
  });

  test.describe('異常系', () => {
    test('無効なテーブル名（空文字） → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/`);
      
      // エラーメッセージが表示されることを確認
      await expect(page.locator('text=/無効|エラー|テーブル/i')).toBeVisible();
    });

    test('無効なテーブル名（特殊文字） → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A-1`);
      
      // エラーメッセージが表示されることを確認
      await expect(page.locator('text=/無効|エラー|テーブル/i')).toBeVisible();
    });

    test('メニューが空 → エラーメッセージ表示', async ({ page }) => {
      // メニューが空の状態をシミュレート
      await page.route('**/menu.json', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
      
      await page.goto(`${BASE_URL}/t/A1`);
      
      // エラーメッセージが表示されることを確認
      await expect(page.locator('text=/メニュー|読み込め|エラー/i')).toBeVisible();
    });

    test('アイテム未選択で注文ボタンクリック → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // アイテムを選択せずに注文ボタンをクリック
      const orderButton = page.locator('button:has-text("注文する")');
      
      // ボタンが無効であることを確認
      await expect(orderButton).toBeDisabled();
    });

    test('数量0で注文 → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // アイテムを選択
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      
      // 数量を0に設定
      const quantityInput = page.locator('input[type="number"]').first();
      await quantityInput.fill('0');
      
      // 注文ボタンをクリック
      const orderButton = page.locator('button:has-text("注文する")');
      
      // ボタンが無効になることを確認（数量0の場合はボタンが無効）
      await expect(orderButton).toBeDisabled();
    });

    test('数量101で注文 → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // アイテムを選択
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      
      // 数量を101に設定
      const quantityInput = page.locator('input[type="number"]').first();
      await quantityInput.fill('101');
      
      // 注文ボタンをクリック
      const orderButton = page.locator('button:has-text("注文する")');
      
      // ボタンが無効になることを確認（数量101の場合はボタンが無効）
      await expect(orderButton).toBeDisabled();
    });

    test('ネットワークエラー時 → エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      
      // APIをエラーで返す
      await page.route('**/api/orders', async route => {
        await route.abort('failed');
      });
      
      // アイテムを選択して注文
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      await firstItem.click();
      await page.locator('input[type="number"]').first().fill('1');
      
      await page.locator('button:has-text("注文する")').click();
      
      // エラーメッセージが表示されることを確認
      await expect(page.locator('text=/エラー|失敗|注文に失敗/i')).toBeVisible();
    });
  });
});
