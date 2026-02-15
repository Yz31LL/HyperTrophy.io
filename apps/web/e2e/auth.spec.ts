import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('h1')).toContainText(/Welcome/i)
  })

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=/Sign Up/i')
    await expect(page).toHaveURL(/.*signup/)
  })
})
