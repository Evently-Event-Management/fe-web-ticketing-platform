import { test, expect } from '../test-utils';
import { CreateOrganizationDialog, DeleteOrganizationDialog } from '@/components/OrganizationDialog';
import { OrganizationProvider } from '@/providers/OrganizationProvider';
import React from 'react';
import { mockOrganizations } from './mocks/organizationMock';

// Mock the hooks and context
const mockCreateOrganization = vi.fn();
const mockDeleteOrganization = vi.fn();

vi.mock('@/providers/OrganizationProvider', () => ({
  useOrganization: () => ({
    createOrganization: mockCreateOrganization,
    deleteOrganization: mockDeleteOrganization,
    refreshOrganizations: vi.fn(),
    organizations: mockOrganizations,
  }),
  OrganizationProvider: ({ children }) => <>{children}</>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

test.describe('Organization Dialogs', () => {
  test('CreateOrganizationDialog renders correctly', async ({ page, mount }) => {
    const Wrapper = () => (
      <CreateOrganizationDialog>
        <button>Open Dialog</button>
      </CreateOrganizationDialog>
    );
    
    await mount(<Wrapper />);
    
    // Click the trigger button
    await page.getByRole('button', { name: 'Open Dialog' }).click();
    
    // Verify dialog content
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create a new organization')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Website')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    
    // Test form submission (without filling in required fields)
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    
    // Fill in form and submit
    await page.getByLabel('Name').fill('New Test Organization');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify the createOrganization function was called
    expect(mockCreateOrganization).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Test Organization',
      email: 'test@example.com',
    }));
  });
  
  test('DeleteOrganizationDialog renders correctly', async ({ page, mount }) => {
    const testOrg = mockOrganizations[0];
    const Wrapper = () => (
      <DeleteOrganizationDialog organization={testOrg}>
        <button>Delete Org</button>
      </DeleteOrganizationDialog>
    );
    
    await mount(<Wrapper />);
    
    // Click the trigger button
    await page.getByRole('button', { name: 'Delete Org' }).click();
    
    // Verify dialog content
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(`Delete ${testOrg.name}`)).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
    
    // Test confirmation
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify the deleteOrganization function was called
    expect(mockDeleteOrganization).toHaveBeenCalledWith(testOrg.id);
  });
});