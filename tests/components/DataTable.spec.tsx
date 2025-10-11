import { test, expect } from '../test-utils';
import { DataTable } from '@/components/DataTable';
import React from 'react';
import { mockOrganizations } from './mocks/organizationMock';
import { ColumnDef } from '@tanstack/react-table';
import { OrganizationResponse } from '@/types/oraganizations';

test.describe('DataTable Component', () => {
  test('renders table with data correctly', async ({ page, mount }) => {
    // Define simple test columns
    const columns: ColumnDef<OrganizationResponse>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'eventCount',
        header: 'Events',
      },
      {
        accessorKey: 'website',
        header: 'Website',
      },
    ];

    await mount(
      <DataTable 
        columns={columns} 
        data={mockOrganizations} 
      />
    );

    // Check if table headers are rendered
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Events' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Website' })).toBeVisible();
    
    // Check if data is rendered in cells
    for (const org of mockOrganizations) {
      await expect(page.getByRole('cell', { name: org.name })).toBeVisible();
      await expect(page.getByRole('cell', { name: String(org.eventCount) })).toBeVisible();
      if (org.website) {
        await expect(page.getByRole('cell', { name: new RegExp(org.website) })).toBeVisible();
      }
    }
  });

  test('renders empty state when no data is provided', async ({ page, mount }) => {
    const columns: ColumnDef<OrganizationResponse>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ];

    await mount(
      <DataTable 
        columns={columns} 
        data={[]} 
      />
    );

    // Verify empty state is shown
    await expect(page.getByText('No results.')).toBeVisible();
  });

  test('supports pagination for large datasets', async ({ page, mount }) => {
    // Create a larger dataset for pagination testing
    const largeDataset = Array.from({ length: 25 }, (_, i) => ({
      ...mockOrganizations[0],
      id: `org-${i + 1}`,
      name: `Organization ${i + 1}`,
    }));

    const columns: ColumnDef<OrganizationResponse>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ];

    await mount(
      <DataTable 
        columns={columns} 
        data={largeDataset} 
      />
    );

    // Check if pagination controls are visible
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeVisible();
    
    // Check first page content
    await expect(page.getByText('Organization 1')).toBeVisible();
    
    // Navigate to next page
    await page.getByRole('button', { name: 'Go to next page' }).click();
    
    // Check second page content (assuming 10 items per page)
    await expect(page.getByText('Organization 11')).toBeVisible();
  });
});