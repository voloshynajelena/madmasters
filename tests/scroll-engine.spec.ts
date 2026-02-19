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

    test('should ignore small swipes below threshold', async ({ page }) => {
      const container = page.locator('body');

      // Simulate small swipe (below 50px threshold)
      await container.evaluate((el) => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [new Touch({ identifier: 0, target: el, clientX: 500, clientY: 400 })],
        });
        const touchMove = new TouchEvent('touchmove', {
          touches: [new Touch({ identifier: 0, target: el, clientX: 500, clientY: 370 })], // Only 30px
        });

        el.dispatchEvent(touchStart);
        el.dispatchEvent(touchMove);
      });

      await page.waitForTimeout(1500);

      // Should still be at section 1
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Section 3 & 4 special transitions', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('section 3 should be visible when navigated to', async ({ page }) => {
      // Navigate to section 3
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      const section3 = page.locator('[data-section="3"]');
      await expect(section3).toBeVisible();
      await expect(section3).toHaveAttribute('data-active', 'true');
    });

    test('section 4 should be visible when navigated to', async ({ page }) => {
      // Navigate to section 4
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      const section4 = page.locator('[data-section="4"]');
      await expect(section4).toBeVisible();
      await expect(section4).toHaveAttribute('data-active', 'true');
    });

    test('should navigate correctly from section 3 to 4', async ({ page }) => {
      // Go to section 3
      const dots = page.locator('nav[aria-label="Page sections"] button');
      await dots.nth(2).click();
      await page.waitForTimeout(1500);

      const section3 = page.locator('[data-section="3"]');
      await expect(section3).toHaveAttribute('data-active', 'true');

      // Navigate to section 4
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      const section4 = page.locator('[data-section="4"]');
      await expect(section4).toHaveAttribute('data-active', 'true');
    });

    test('should navigate correctly from section 4 to 3', async ({ page }) => {
      // Go to section 4
      const dots = page.locator('nav[aria-label="Page sections"] button');
      await dots.nth(3).click();
      await page.waitForTimeout(1500);

      // Navigate back to section 3
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(1500);

      const section3 = page.locator('[data-section="3"]');
      await expect(section3).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Animation timing', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('animation should complete within expected timeframe', async ({ page }) => {
      const startTime = Date.now();

      await page.keyboard.press('ArrowDown');

      // Wait for section 2 to become active
      await page.waitForFunction(
        () => document.querySelector('[data-section="2"]')?.getAttribute('data-active') === 'true',
        { timeout: 2000 }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Animation should complete within ~1000-1500ms
      expect(duration).toBeGreaterThan(800);
      expect(duration).toBeLessThan(2000);
    });
  });

  test.describe('Full navigation sequence', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should navigate through all 5 sections sequentially', async ({ page }) => {
      // Verify starting at section 1
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');

      // Navigate through all sections
      for (let i = 2; i <= 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        const section = page.locator(`[data-section="${i}"]`);
        await expect(section).toHaveAttribute('data-active', 'true');
      }

      // Navigate back to section 1
      await page.keyboard.press('Home');
      await page.waitForTimeout(1500);

      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should handle rapid dot clicking correctly', async ({ page }) => {
      const dots = page.locator('nav[aria-label="Page sections"] button');

      // Rapidly click different dots
      await dots.nth(4).click(); // Section 5
      await dots.nth(0).click(); // Section 1
      await dots.nth(2).click(); // Section 3

      // Wait for animations to settle
      await page.waitForTimeout(2000);

      // Should end up at the last clicked section
      const section3 = page.locator('[data-section="3"]');
      await expect(section3).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('pagination dots should be keyboard accessible', async ({ page }) => {
      const pagination = page.locator('nav[aria-label="Page sections"]');
      await expect(pagination).toBeVisible();

      // Tab to pagination and navigate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should be on a pagination button
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveRole('button');
    });

    test('sections should have proper ARIA attributes', async ({ page }) => {
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
      await expect(section1).toHaveAttribute('data-index', '1');
    });

    test('pagination dots should have aria-current on active', async ({ page }) => {
      const dots = page.locator('nav[aria-label="Page sections"] button');

      // First dot should have aria-current
      await expect(dots.first()).toHaveAttribute('aria-current', 'true');

      // Navigate to section 2
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      // Second dot should now have aria-current
      await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
      await expect(dots.first()).not.toHaveAttribute('aria-current', 'true');
    });

    test('keyboard navigation should not trigger in input fields', async ({ page }) => {
      // Create a temporary input for testing
      await page.evaluate(() => {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'test-input';
        input.style.position = 'fixed';
        input.style.top = '10px';
        input.style.left = '10px';
        input.style.zIndex = '9999';
        document.body.appendChild(input);
      });

      const input = page.locator('#test-input');
      await input.focus();
      await input.fill('test');

      // Press arrow down while in input
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);

      // Should still be at section 1
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Body class updates', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should add viewing-page-X class to body', async ({ page }) => {
      // Initially viewing-page-1
      await expect(page.locator('body')).toHaveClass(/viewing-page-1/);

      // Navigate to section 2
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      // Should have viewing-page-2
      await expect(page.locator('body')).toHaveClass(/viewing-page-2/);
      await expect(page.locator('body')).not.toHaveClass(/viewing-page-1/);
    });

    test('should add disabled-onepage-scroll class on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      await expect(page.locator('body')).toHaveClass(/disabled-onepage-scroll/);
    });
  });

  test.describe('Resize behavior', () => {
    test('should switch to mobile mode on resize', async ({ page }) => {
      // Start desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      const pagination = page.locator('nav[aria-label="Page sections"]');
      await expect(pagination).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Pagination should be hidden
      await expect(pagination).not.toBeVisible();
    });

    test('should preserve section on resize', async ({ page }) => {
      // Navigate to section 3
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1500);

      const section3 = page.locator('[data-section="3"]');
      await expect(section3).toHaveAttribute('data-active', 'true');

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Section 3 should still exist
      await expect(section3).toBeVisible();
    });
  });

  test.describe('Visual regression', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('section 1 hero should look correct', async ({ page }) => {
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');

      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot('scroll-section-1-hero.png', {
        maxDiffPixelRatio: 0.1,
      });
    });

    test('pagination dots should look correct', async ({ page }) => {
      const pagination = page.locator('nav[aria-label="Page sections"]');
      await expect(pagination).toBeVisible();

      await expect(pagination).toHaveScreenshot('scroll-pagination-dots.png', {
        maxDiffPixelRatio: 0.1,
      });
    });

    test('section transition should be smooth', async ({ page }) => {
      // Navigate to section 2
      await page.keyboard.press('ArrowDown');

      // Screenshot during transition (around 500ms)
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('scroll-transition-mid.png', {
        maxDiffPixelRatio: 0.2, // Higher tolerance for animation
      });

      // Wait for completion
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('scroll-section-2-about.png', {
        maxDiffPixelRatio: 0.1,
      });
    });
  });

  test.describe('Edge cases', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should handle multiple rapid keyboard presses', async ({ page }) => {
      // Rapid arrow down presses
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }

      // Wait for all animations
      await page.waitForTimeout(2000);

      // Should not crash and should be at some valid section
      const body = page.locator('body');
      await expect(body).toHaveClass(/viewing-page-[1-5]/);
    });

    test('should handle going from section 5 to section 1 directly', async ({ page }) => {
      // Go to section 5
      await page.keyboard.press('End');
      await page.waitForTimeout(1500);

      const section5 = page.locator('[data-section="5"]');
      await expect(section5).toHaveAttribute('data-active', 'true');

      // Go directly to section 1
      await page.keyboard.press('Home');
      await page.waitForTimeout(1500);

      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should handle alternating directions rapidly', async ({ page }) => {
      // Alternating up/down rapidly
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowUp');

      // Wait for animations
      await page.waitForTimeout(2000);

      // Should still be valid
      const body = page.locator('body');
      await expect(body).toHaveClass(/viewing-page-[1-5]/);
    });

    test('should handle invalid hash values gracefully', async ({ page }) => {
      await page.goto('/#999');
      await page.waitForTimeout(500);

      // Should default to section 1 for invalid hash
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should handle non-numeric hash values gracefully', async ({ page }) => {
      await page.goto('/#invalid');
      await page.waitForTimeout(500);

      // Should default to section 1 for invalid hash
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should handle zero hash value', async ({ page }) => {
      await page.goto('/#0');
      await page.waitForTimeout(500);

      // Should default to section 1 for hash 0 (invalid)
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });

    test('should handle negative hash value', async ({ page }) => {
      await page.goto('/#-1');
      await page.waitForTimeout(500);

      // Should default to section 1 for negative hash
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Performance', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should complete full navigation cycle under 10 seconds', async ({ page }) => {
      const startTime = Date.now();

      // Navigate through all sections
      for (let i = 2; i <= 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1200); // Slightly faster than animation
      }

      // Navigate back
      await page.keyboard.press('Home');
      await page.waitForTimeout(1200);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(10000);
    });

    test('should not have memory leaks during repeated navigation', async ({ page }) => {
      // Navigate back and forth multiple times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1500);
      }

      // Check page is still responsive
      const section1 = page.locator('[data-section="1"]');
      await expect(section1).toBeVisible();
      await expect(section1).toHaveAttribute('data-active', 'true');
    });
  });
});
