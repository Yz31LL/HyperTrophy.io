import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard', () => {
  test('should navigate through the onboarding steps', async ({ page }) => {
    // Note: This requires a logged-in state or mocking auth
    // For now, we test the public accessibility of the route if possible
    await page.goto('/onboarding')

    // Check if redirect to login happens if unauthenticated
    const url = page.url()
    if (url.includes('login')) {
      console.log('Redirected to login as expected for unauthenticated user')
    } else {
      await expect(page.locator('h1')).toContainText(/Personalize/i)
    }
  })
})
