import { test, expect } from '../test-utils';
import React from 'react';
import { mockOrganizations } from './mocks/organizationMock';

// Mock the hooks and providers
jest.mock('@/providers/OrganizationProvider', () => ({
  useOrganization: () => ({
    organizations: mockOrganizations,
    isLoading: false,
    error: null,
    createOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    switchOrganization: jest.fn(),
    refreshOrganizations: jest.fn(),
    uploadLogo: jest.fn(),
    removeLogo: jest.fn(),
  }),
  OrganizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

test.describe('OrganizationsPage', () => {
  test('renders organization table with data', async ({ page, mount }) => {
    await page.goto('/manage/organization/my-organizations');
    
    // Wait for the page to load and check that the heading is present
    await expect(page.getByRole('heading', { name: 'Organizations' })).toBeVisible();
    
    // Check for the presence of organization names
    for (const org of mockOrganizations) {
      await expect(page.getByText(org.name)).toBeVisible();
    }
    
    // Verify create button exists
    await expect(page.getByRole('button', { name: 'Create Organization' })).toBeVisible();
  });

  test('opens dropdown menu and shows actions', async ({ page }) => {
    await page.goto('/manage/organization/my-organizations');
    
    // Click the first action menu
    await page.getByRole('button', { name: 'Open menu' }).first().click();
    
    // Verify dropdown items
    await expect(page.getByText('Copy organization ID')).toBeVisible();
    await expect(page.getByText('Edit')).toBeVisible();
    await expect(page.getByText('Delete')).toBeVisible();
  });

  test('clicking create organization button opens dialog', async ({ page }) => {
    await page.goto('/manage/organization/my-organizations');
    
    // Click the create organization button
    await page.getByRole('button', { name: 'Create Organization' }).click();
    
    // Verify the dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create a new organization')).toBeVisible();
  });

  test('shows loading state when data is loading', async ({ page, mount }) => {
    // Mock the loading state
    jest.mock('@/providers/OrganizationProvider', () => ({
      useOrganization: () => ({
        organizations: [],
        isLoading: true,
        error: null,
      }),
      OrganizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));

    await page.goto('/manage/organization/my-organizations');
    
    // Check for loading skeletons
    const skeletons = await page.locator('.skeleton').all();
    expect(skeletons.length).toBeGreaterThan(0);
  });
});