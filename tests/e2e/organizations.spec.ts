import { test, expect } from '@playwright/test';

test.describe('Organization Management Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to the organizations page and handle authentication if needed
    // Note: You'll need to handle authentication based on your app's auth flow
    await page.goto('/manage/organization/my-organizations');

    // Mock authentication if needed
    // This is a simplified example, you'd need to adjust based on your actual auth flow
    await page.evaluate(() => {
      // Mock keycloak token and auth state
      localStorage.setItem('keycloak-token', 'mock-token');
      
      // Mock user groups to indicate admin status if needed
      const mockUserData = {
        user_groups: ['/Permissions/Users/System Admins']
      };
      
      // Store mock user data
      sessionStorage.setItem('keycloak-userinfo', JSON.stringify(mockUserData));
    });

    // Reload page after auth mocking
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Organizations")');
  });

  test('displays organization table with data', async ({ page }) => {
    // Verify page title and description
    await expect(page.locator('h1')).toContainText('Organizations');
    await expect(page.locator('p.text-muted-foreground')).toContainText('Manage all your organizations');
    
    // Verify Create Organization button exists
    await expect(page.getByRole('button', { name: 'Create Organization' })).toBeVisible();
    
    // Check if table is rendered with headers
    await expect(page.getByRole('columnheader', { name: 'Organization Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Website' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible();
  });

  test('opens create organization dialog', async ({ page }) => {
    // Click the create organization button
    await page.getByRole('button', { name: 'Create Organization' }).click();
    
    // Verify the dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create a new organization')).toBeVisible();
    
    // Check form fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Website')).toBeVisible();
    
    // Close dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('opens organization actions dropdown', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[role="grid"]');
    
    // Click on the actions menu for the first organization
    await page.locator('.h-8.w-8.p-0').first().click();
    
    // Verify dropdown actions are visible
    await expect(page.getByText('Copy organization ID')).toBeVisible();
    await expect(page.getByText('Edit')).toBeVisible();
    await expect(page.getByText('Delete')).toBeVisible();
    
    // Click outside to close dropdown
    await page.click('h1:has-text("Organizations")');
  });

  test('organization edit action navigates to edit page', async ({ page }) => {
    // Mock router
    await page.route('**', route => {
      route.continue();
    });
    
    // Wait for table to load
    await page.waitForSelector('[role="grid"]');
    
    // Open dropdown and click edit
    await page.locator('.h-8.w-8.p-0').first().click();
    await page.getByText('Edit').click();
    
    // Check navigation occurred
    // Note: This test will need to be adjusted based on your navigation setup
    // In a real test, you'd verify the URL changed to the edit page
    await expect(page).toHaveURL(/\/manage\/organization\/.*\/edit/);
  });

  test('displays empty state when no organizations', async ({ page }) => {
    // Mock an empty organizations list
    await page.evaluate(() => {
      // Override the data fetch functions
      window.fetch = async (url) => {
        if (url.includes('/organizations')) {
          return {
            ok: true,
            json: async () => ([]),
            status: 200,
          };
        }
        return fetch(url);
      };
    });
    
    // Reload page to apply mocks
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Organizations")');
    
    // Verify empty state or message is shown
    // Adjust based on your actual empty state UI
    await expect(page.locator('table')).toContainText('No results');
  });
});