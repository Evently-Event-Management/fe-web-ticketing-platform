import { OrganizationResponse } from '@/types/oraganizations';

export const mockOrganizations: OrganizationResponse[] = [
  {
    id: '1',
    name: 'Test Organization 1',
    website: 'https://testorg1.com',
    logoUrl: '/images/logo-test-1.png',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-10T00:00:00.000Z',
    eventCount: 5
  },
  {
    id: '2',
    name: 'Test Organization 2',
    website: 'https://testorg2.com',
    logoUrl: undefined,
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2023-02-10T00:00:00.000Z',
    eventCount: 2
  },
  {
    id: '3',
    name: 'Test Organization 3',
    website: undefined,
    logoUrl: '/images/logo-test-3.png',
    createdAt: '2023-03-01T00:00:00.000Z',
    updatedAt: '2023-03-10T00:00:00.000Z',
    eventCount: 0
  }
];