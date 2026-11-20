/**
 * Shared mock for ../../_hooks/usePlannerSavedItems.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/usePlannerSavedItems', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems')
 *   );
 *
 * Default return value is an empty array. Override in specific tests with:
 *   vi.mocked(usePlannerSavedItems).mockReturnValueOnce([...])
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

export const usePlannerSavedItems = vi.fn(() => []);

export const PlannerSavedItemsProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);
