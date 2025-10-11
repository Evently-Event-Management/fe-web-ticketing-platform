import { test, expect } from '@playwright/test';

test.describe('Organization Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the organizations page and handle authentication if needed
    await page.goto('/manage/organization/my-organizations');

    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('keycloak-token', 'mock-token');
      const mockUserData = {
        user_groups: ['/Permissions/Users/System Admins']
      };
      sessionStorage.setItem('keycloak-userinfo', JSON.stringify(mockUserData));
    });

    // Reload page after auth mocking
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Organizations")');
  });

  test('Create Organization Dialog has proper validation', async ({ page }) => {
    // Open the dialog
    await page.getByRole('button', { name: 'Create Organization' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Test validation - try submitting without required fields
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    // Check validation messages
    await expect(page.getByText('Name is required')).toBeVisible();
    
    // Fill in just the name field
    await page.getByLabel('Name').fill('Test Organization');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    // Website field is optional, so form should submit
    // In a real test, you'd verify API call happens or mock the response
  });

  test('Create Organization Dialog handles website format validation', async ({ page }) => {
    // Open the dialog
    await page.getByRole('button', { name: 'Create Organization' }).click();
    
    // Fill name (required field)
    await page.getByLabel('Name').fill('Test Organization');
    
    // Fill website with invalid format
    await page.getByLabel('Website').fill('invalid-website');
    
    // Try to submit
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    // Check for validation error
    await expect(page.getByText(/website/i, { exact: false })).toBeVisible();
    
    // Fix the website format
    await page.getByLabel('Website').fill('https://valid-website.com');
    
    // Submit again
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    // Check the dialog closes (meaning submission was accepted)
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Delete Organization Dialog shows confirmation and handles deletion', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[role="grid"]');
    
    // Open dropdown for the first organization
    await page.locator('.h-8.w-8.p-0').first().click();
    
    // Click delete option
    await page.getByText('Delete').click();
    
    // Verify delete confirmation dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
    
    // Test cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Reopen dialog
    await page.locator('.h-8.w-8.p-0').first().click();
    await page.getByText('Delete').click();
    
    // Mock the delete API call
    await page.route('**/api/organizations/**', route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    
    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});