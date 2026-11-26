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
 * The providers only render their children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeDish } from '#fixtures/dish';
import type {
	Dish,
	MealDishes,
} from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDish';
import type { DishDraft } from '@/app/[planner]/calendar/_components/MealForm/types';

export const useDish = vi.fn((): Dish => makeDish());

export const MealDishesProvider = vi.fn(
	({ children }: { value: MealDishes; children: ReactNode }) => children,
);

export const DishProvider = vi.fn(
	({ children }: { dish: DishDraft; children: ReactNode }) => children,
);
