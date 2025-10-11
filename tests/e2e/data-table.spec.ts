import { test, expect } from '@playwright/test';

test.describe('DataTable Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the organizations page where DataTable is used
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

  test('table renders with correct columns', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[role="grid"]');
    
    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Organization Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Website' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible();
  });

  test('table supports pagination if many rows', async ({ page }) => {
    // Mock a response with many organizations (enough to trigger pagination)
    await page.route('**/api/organizations**', route => {
      const organizations = Array.from({ length: 25 }, (_, i) => ({
        id: `org-${i}`,
        name: `Organization ${i}`,
        website: `https://org${i}.com`,
        logoUrl: null,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-10T00:00:00.000Z',
      }));
      
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(organizations),
      });
    });
    
    // Reload page to apply mock
    await page.reload();
    await page.waitForSelector('[role="grid"]');
    
    // Check if pagination controls are visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check if only first set of rows are visible (assuming 10 per page)
    await expect(page.getByText('Organization 0')).toBeVisible();
    
    // Navigate to next page
    await page.getByRole('button', { name: 'Go to next page' }).click();
    
    // Check if next set of rows are visible
    await expect(page.getByText('Organization 10')).toBeVisible();
    await expect(page.getByText('Organization 0')).not.toBeVisible();
  });

  test('table supports sorting by column', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[role="grid"]');
    
    // Click on the "Organization Name" header to sort
    await page.getByRole('columnheader', { name: 'Organization Name' }).click();
    
    // Verify sorting indicator appears (this will depend on your UI implementation)
    // For example, looking for a sort icon or class
    await expect(page.locator('th[aria-sort="ascending"]')).toBeVisible();
    
    // Click again to reverse sort
    await page.getByRole('columnheader', { name: 'Organization Name' }).click();
    
    // Verify sort direction changed
    await expect(page.locator('th[aria-sort="descending"]')).toBeVisible();
  });

  test('table shows empty state when no data', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/organizations**', route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    
    // Reload page to apply mock
    await page.reload();
    await page.waitForSelector('[role="grid"]');
    
    // Check for empty state message
    await expect(page.getByText('No results')).toBeVisible();
  });
});