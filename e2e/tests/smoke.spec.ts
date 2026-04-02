import { test, expect } from '@playwright/test';
import { apiUrls } from '../fixtures';

test.describe('Smoke Tests', () => {
  test('health endpoint returns ok @api', async ({ request }) => {
    const response = await request.get(`${apiUrls.base}/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('frontend loads login page @ui', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-card')).toBeVisible();
  });

  test('CORS rejects unknown origin @api', async ({ request }) => {
    const response = await request.fetch(`${apiUrls.base}/health`, {
      headers: { Origin: 'https://evil.example.com' },
    });
    const allowOrigin = response.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('https://evil.example.com');
  });
});
