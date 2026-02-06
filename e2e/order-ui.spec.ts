import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('注文UI - /t/[table]', () => {
  test.describe('正常系', () => {
    test('有効なテーブル名でアクセス → メニューが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // メニューが表示されることを確認
      await expect(page.locator('text=飲み放題メニュー')).toBeVisible();

      // テーブル名が表示される
      await expect(page.locator('text=A1')).toBeVisible();
    });

    test('メニューアイテムが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // メニューアイテムが表示されることを確認
      const menuItems = page.locator('[data-testid="menu-item"]');
      await expect(menuItems.first()).toBeVisible({ timeout: 10000 });
    });

    test('数量を増やすと選択中カウントが更新される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // 初期状態は0杯 (ヘッダーの選択中カウント)
      await expect(page.locator('span:has-text("0杯")')).toBeVisible();

      // +ボタンをクリック
      const plusButton = page.locator('[data-testid="menu-item"]').first().locator('button:has-text("+")');
      await plusButton.click();

      // 1杯になる
      await expect(page.locator('span:has-text("1杯")')).toBeVisible();
    });

    test('注文ボタンが数量0では無効、1以上で有効になる', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // 初期状態では注文ボタンが無効
      const orderButton = page.locator('button:has-text("注文する")');
      await expect(orderButton).toBeDisabled();

      // +ボタンをクリック
      const plusButton = page.locator('[data-testid="menu-item"]').first().locator('button:has-text("+")');
      await plusButton.click();

      // 注文ボタンが有効になる
      await expect(orderButton).toBeEnabled();
    });

    test('注文送信 → 成功モーダルが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // +ボタンをクリック
      const plusButton = page.locator('[data-testid="menu-item"]').first().locator('button:has-text("+")');
      await plusButton.click();

      // 注文ボタンをクリック
      const orderButton = page.locator('button:has-text("注文する")');
      await orderButton.click();

      // 成功モーダルが表示される
      await expect(page.locator('text=注文完了')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=注文番号')).toBeVisible();
    });

    test('モーダルを閉じると選択がリセットされる', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // +ボタンをクリック
      const plusButton = page.locator('[data-testid="menu-item"]').first().locator('button:has-text("+")');
      await plusButton.click();

      // 注文送信
      await page.locator('button:has-text("注文する")').click();
      await expect(page.locator('text=注文完了')).toBeVisible({ timeout: 10000 });

      // 閉じるボタンをクリック
      await page.locator('button:has-text("閉じる")').click();

      // 選択がリセットされる (ヘッダーの選択中カウント)
      await expect(page.locator('span:has-text("0杯")')).toBeVisible();
    });

    test('複数アイテムを選択して注文', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      const menuItems = page.locator('[data-testid="menu-item"]');
      const count = await menuItems.count();

      if (count >= 2) {
        // 2つのアイテムを選択
        await menuItems.nth(0).locator('button:has-text("+")').click();
        await menuItems.nth(1).locator('button:has-text("+")').click();

        // 2杯になる (ヘッダーの選択中カウント)
        await expect(page.locator('span:has-text("2杯")')).toBeVisible();

        // 注文送信
        await page.locator('button:has-text("注文する")').click();
        await expect(page.locator('text=注文完了')).toBeVisible({ timeout: 10000 });
      }
    });

    test('数量を増減できる', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      const firstItem = page.locator('[data-testid="menu-item"]').first();
      const plusButton = firstItem.locator('button:has-text("+")');
      const minusButton = firstItem.locator('button:has-text("-")');

      // 3回+をクリック
      await plusButton.click();
      await plusButton.click();
      await plusButton.click();
      await expect(page.locator('span:has-text("3杯")')).toBeVisible();

      // 1回-をクリック
      await minusButton.click();
      await expect(page.locator('span:has-text("2杯")')).toBeVisible();
    });
  });

  test.describe('異常系', () => {
    test('無効なテーブル名（ハイフン含む）→ エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A-1`);

      // エラーメッセージが表示される
      await expect(page.locator('text=無効なテーブル名です')).toBeVisible();
    });

    test('無効なテーブル名（日本語）→ エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/テーブル1`);

      await expect(page.locator('text=無効なテーブル名です')).toBeVisible();
    });

    test('無効なテーブル名（11文字以上）→ エラーメッセージ表示', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/ABCDEFGHIJK`); // 11文字

      await expect(page.locator('text=無効なテーブル名です')).toBeVisible();
    });

    test('数量上限10に達すると+ボタンが無効になる', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      const firstItem = page.locator('[data-testid="menu-item"]').first();
      const plusButton = firstItem.locator('button:has-text("+")');

      // 10回クリック
      for (let i = 0; i < 10; i++) {
        await plusButton.click();
      }

      // 10杯になる (ヘッダーの選択中カウント)
      await expect(page.locator('span:has-text("10杯")')).toBeVisible();

      // +ボタンが無効になる
      await expect(plusButton).toBeDisabled();
    });

    test('数量0では-ボタンが無効', async ({ page }) => {
      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      const firstItem = page.locator('[data-testid="menu-item"]').first();
      const minusButton = firstItem.locator('button:has-text("-")');

      // -ボタンが無効
      await expect(minusButton).toBeDisabled();
    });

    test('ネットワークエラー時 → エラーメッセージ表示', async ({ page }) => {
      // APIをエラーで返す設定をしてからページにアクセス
      await page.route('**/api/orders', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: '注文に失敗しました' }),
        });
      });

      await page.goto(`${BASE_URL}/t/A1`);
      await page.waitForLoadState('networkidle');

      // アイテムを選択して注文
      const plusButton = page.locator('[data-testid="menu-item"]').first().locator('button:has-text("+")');
      await plusButton.click();

      await page.locator('button:has-text("注文する")').click();

      // エラーメッセージが表示される
      await expect(page.locator('text=注文に失敗しました')).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe('店舗別注文UI - /s/[storeSlug]/t/[table]', () => {
  test('店舗固有のURLでアクセス可能', async ({ page }) => {
    const testSlug = 'test-izakaya-86384';
    await page.goto(`${BASE_URL}/s/${testSlug}/t/A1`);
    await page.waitForLoadState('networkidle');

    // ページが表示される
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('存在しない店舗 → エラー表示', async ({ page }) => {
    await page.goto(`${BASE_URL}/s/non-existent-store-xyz/t/A1`);
    await page.waitForLoadState('networkidle');

    // エラーメッセージが表示される
    await expect(page.locator('body')).toContainText(/店舗|見つかりません|not found/i);
  });
});
