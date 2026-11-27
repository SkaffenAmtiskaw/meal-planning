/**
 * Shared mock for MealForm's _hooks/useDishLinking.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/useDishLinking', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDishLinking')
 *   );
 *
 * By default useDishLinking and useDishLinkingContext return makeDishLinking()
 * from #fixtures/dish. Override in specific tests with:
 *   vi.mocked(useDishLinkingContext).mockReturnValue(makeDishLinking({ ... }))
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeDishLinking } from '#fixtures/dish';
import type { DishLinking } from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDishLinking';

export const useDishLinking = vi.fn((): DishLinking => makeDishLinking());

export const useDishLinkingContext = vi.fn(
	(): DishLinking => makeDishLinking(),
);

export const DishLinkingProvider = vi.fn(
	({ children }: { value: DishLinking; children: ReactNode }) => children,
);
