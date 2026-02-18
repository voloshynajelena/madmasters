import { test, expect } from '@playwright/test';

test.describe('Full Page Scroll Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for scroll engine to initialize
    await page.waitForSelector('[data-section="1"]');
  });

  test.describe('Desktop behavior (>600px)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should start at section 1', async ({ page }) => {
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should move to next section on scroll down', async ({ page }) => {
      // Scroll down
      await page.mouse.wheel(0, 100);

      // Wait for animation
      await page.waitForTimeout(1500);

      const section2 = page.locator('[data-section="2"]');
      await expect(section2).toHaveAttribute('data-active', 'true');
    });

    test('should move to previous section on scroll up', async ({ page }) => {
      // First go to section 2
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(1500);

      // Then scroll up
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(1500);

      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should prevent rapid scrolling during animation', async ({ page }) => {
      // Rapid scrolls
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, 100);

      // Should only move one section
      await page.waitForTimeout(1500);

      const section2 = page.locator('[data-section="2"]');
      await expect(section2).toHaveAttribute('data-active', 'true');
    });

    test('should respect quiet period after animation', async ({ page }) => {
      // Scroll to section 2
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(1100); // Just after animation

      // Try scrolling during quiet period
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);

      // Should still be at section 2
      const section2 = page.locator('[data-section="2"]');
      await expect(section2).toHaveAttribute('data-active', 'true');
    });

    test('should not scroll past first section', async ({ page }) => {
      // Try scrolling up from first section
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(1500);

      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should not scroll past last section', async ({ page }) => {
      // Navigate to last section
      await page.keyboard.press('End');
      await page.waitForTimeout(1500);

      const section5 = page.locator('[data-section="5"]');
      await expect(section5).toHaveAttribute('data-active', 'true');

      // Try scrolling down
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(1500);

      // Should still be at section 5
      await expect(section5).toHaveAttribute('data-active', 'true');
    });

    test.describe('Keyboard navigation', () => {
      test('should navigate down with ArrowDown', async ({ page }) => {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        const section2 = page.locator('[data-section="2"]');
        await expect(section2).toHaveAttribute('data-active', 'true');
      });

      test('should navigate up with ArrowUp', async ({ page }) => {
        // Go to section 2 first
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1500);

        const section1 = page.locator('[data-section="1"]');
        await expect(section1).toHaveAttribute('data-active', 'true');
      });

      test('should navigate down with Space', async ({ page }) => {
        await page.keyboard.press('Space');
        await page.waitForTimeout(1500);

        const section2 = page.locator('[data-section="2"]');
        await expect(section2).toHaveAttribute('data-active', 'true');
      });

      test('should navigate down with PageDown', async ({ page }) => {
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(1500);

        const section2 = page.locator('[data-section="2"]');
        await expect(section2).toHaveAttribute('data-active', 'true');
      });

      test('should navigate up with PageUp', async ({ page }) => {
        // Go to section 2 first
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(1500);

        await page.keyboard.press('PageUp');
        await page.waitForTimeout(1500);

        const section1 = page.locator('[data-section="1"]');
        await expect(section1).toHaveAttribute('data-active', 'true');
      });

      test('should go to first section with Home', async ({ page }) => {
        // Go to section 3
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        await page.keyboard.press('Home');
        await page.waitForTimeout(1500);

        const section1 = page.locator('[data-section="1"]');
        await expect(section1).toHaveAttribute('data-active', 'true');
      });

      test('should go to last section with End', async ({ page }) => {
        await page.keyboard.press('End');
        await page.waitForTimeout(1500);

        const section5 = page.locator('[data-section="5"]');
        await expect(section5).toHaveAttribute('data-active', 'true');
      });
    });

    test.describe('Pagination dots', () => {
      test('should display pagination dots', async ({ page }) => {
        const pagination = page.locator('nav[aria-label="Page sections"]');
        await expect(pagination).toBeVisible();

        const dots = pagination.locator('button');
        await expect(dots).toHaveCount(5);
      });

      test('should highlight active dot', async ({ page }) => {
        const firstDot = page
          .locator('nav[aria-label="Page sections"] button')
          .first();
        await expect(firstDot).toHaveAttribute('aria-current', 'true');
      });

      test('should update active dot on scroll', async ({ page }) => {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        const dots = page.locator('nav[aria-label="Page sections"] button');
        const secondDot = dots.nth(1);
        await expect(secondDot).toHaveAttribute('aria-current', 'true');
      });

      test('should navigate on dot click', async ({ page }) => {
        const dots = page.locator('nav[aria-label="Page sections"] button');
        const thirdDot = dots.nth(2);

        await thirdDot.click();
        await page.waitForTimeout(1500);

        const section3 = page.locator('[data-section="3"]');
        await expect(section3).toHaveAttribute('data-active', 'true');
      });
    });

    test.describe('Hash navigation', () => {
      test('should navigate to section via hash', async ({ page }) => {
        await page.goto('/#3');
        await page.waitForTimeout(500);

        const section3 = page.locator('[data-section="3"]');
        await expect(section3).toHaveAttribute('data-active', 'true');
      });

      test('should update hash on navigation', async ({ page }) => {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        expect(page.url()).toContain('#2');
      });
    });
  });

  test.describe('Mobile behavior (<600px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should disable scroll hijacking on mobile', async ({ page }) => {
      // Pagination should not be visible on mobile
      const pagination = page.locator('nav[aria-label="Page sections"]');
      await expect(pagination).not.toBeVisible();
    });

    test('should allow normal scrolling on mobile', async ({ page }) => {
      // Check that sections are not absolutely positioned
      const section1 = page.locator('[data-section="1"]');
      const section2 = page.locator('[data-section="2"]');

      // Both sections should be in the DOM and visible when scrolled to
      await expect(section1).toBeVisible();

      // Scroll to section 2
      await section2.scrollIntoViewIfNeeded();
      await expect(section2).toBeVisible();
    });
  });

  test.describe('Touch/swipe support', () => {
    test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

    test('should navigate on swipe up', async ({ page }) => {
      const container = page.locator('body');

      // Simulate swipe up
      await container.evaluate((el) => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [new Touch({ identifier: 0, target: el, clientX: 500, clientY: 400 })],
        });
        const touchMove = new TouchEvent('touchmove', {
          touches: [new Touch({ identifier: 0, target: el, clientX: 500, clientY: 300 })],
        });

        el.dispatchEvent(touchStart);
        el.dispatchEvent(touchMove);
      });

      await page.waitForTimeout(1500);

      const section2 = page.locator('[data-section="2"]');
      await expect(section2).toHaveAttribute('data-active', 'true');
    });
  });
});
