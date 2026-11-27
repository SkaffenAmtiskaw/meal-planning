/**
 * Shared mock for MealForm's _hooks/useDish.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/useDish', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish')
 *   );
 *
 * By default useDish returns makeDish() from #fixtures/dish. Override in
 * specific tests with:
 *   vi.mocked(useDish).mockReturnValue(makeDish({ ... }))
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeDish } from '#fixtures/dish';
import type {
	Dish,
	DishRowValue,
} from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDish';

export const useDish = vi.fn((): Dish => makeDish());

export const DishProvider = vi.fn(
	({ children }: DishRowValue & { children: ReactNode }) => children,
);
