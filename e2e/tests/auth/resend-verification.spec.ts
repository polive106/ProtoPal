import { test, expect } from '@playwright/test';
import { testIds } from '../../fixtures';

test.describe('Resend Verification', () => {
  test.describe('Resend Verification UI @ui', () => {
    test('should show success for non-existent email (no enumeration)', async ({ page }) => {
      const fakeEmail = `nonexistent-${Date.now()}@example.com`;
      await page.goto(`/check-email?email=${encodeURIComponent(fakeEmail)}`);
      await expect(page.getByTestId(testIds.checkEmail.card)).toBeVisible();

      await page.getByTestId(testIds.checkEmail.btnResend).click();

      // Should show success, NOT an error — prevents user enumeration
      await expect(page.getByTestId(testIds.checkEmail.textResent)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(testIds.checkEmail.alertError)).not.toBeVisible();
    });

    test('should show success for already verified email (no enumeration)', async ({ page }) => {
      // user@example.com is the seeded, already-verified user
      await page.goto(`/check-email?email=${encodeURIComponent('user@example.com')}`);
      await expect(page.getByTestId(testIds.checkEmail.card)).toBeVisible();

      await page.getByTestId(testIds.checkEmail.btnResend).click();

      // Should show success, NOT an error — prevents user enumeration
      await expect(page.getByTestId(testIds.checkEmail.textResent)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(testIds.checkEmail.alertError)).not.toBeVisible();
    });
  });
});
