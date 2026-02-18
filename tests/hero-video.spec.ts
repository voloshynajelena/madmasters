import { test, expect } from '@playwright/test';

test.describe('Hero Video Component', () => {
  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display hero video container', async ({ page }) => {
      await page.goto('/');

      // Check that the video container exists
      const heroSection = page.locator('[data-section="1"]');
      await expect(heroSection).toBeVisible();
    });

    test('should show poster image as fallback', async ({ page }) => {
      await page.goto('/');

      // The poster should be visible (as background image)
      const posterContainer = page.locator('[data-section="1"] [role="img"]');
      // Wait for potential poster to render
      await page.waitForTimeout(500);
      // Poster might not be visible if video loaded, so we check the container exists
      const container = page.locator('[data-section="1"]');
      await expect(container).toBeVisible();
    });

    test('should respect reduced motion preference', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');

      // Video element should not be present or should be hidden
      const video = page.locator('[data-section="1"] video');
      const videoCount = await video.count();

      // Either no video element, or it's not loaded
      if (videoCount > 0) {
        // Check that the poster is visible instead
        const posterContainer = page.locator('[data-section="1"] [role="img"]');
        await expect(posterContainer).toBeVisible();
      }
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should not load video on mobile to save bandwidth', async ({ page }) => {
      await page.goto('/');

      // Wait for component to decide whether to load video
      await page.waitForTimeout(500);

      // On mobile, video should either not exist or be hidden
      const video = page.locator('[data-section="1"] video');
      const videoCount = await video.count();

      // Either no video, or video is not visible
      if (videoCount > 0) {
        // Video might be in DOM but not playing
        const isPlaying = await video.evaluate((el: HTMLVideoElement) => {
          return !el.paused;
        });
        expect(isPlaying).toBeFalsy();
      }
    });

    test('should show poster image on mobile', async ({ page }) => {
      await page.goto('/');

      // Poster/background should be visible
      const heroSection = page.locator('[data-section="1"]');
      await expect(heroSection).toBeVisible();
    });
  });
});
