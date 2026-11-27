/**
 * Shared mock for the calendar's _hooks/useMealForm.
 *
 * Usage in a test file:
 *   vi.mock('../../../_hooks/useMealForm', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm')
 *   );
 *
 * By default the form holds makeMealValues() from #fixtures/dish, and
 * useMealDishes returns makeMealDishes(). Override in specific tests with:
 *   vi.mocked(useMealFormContext).mockReturnValue(...)
 *   vi.mocked(useMealDishes).mockReturnValue(makeMealDishes({ ... }))
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeMealDishes, makeMealValues } from '#fixtures/dish';
import { useForm } from '#mocks/@mantine/form';
import type { MealForm } from '@/app/[planner]/calendar/_components/_hooks/useMealForm';

const mealForm = () =>
	useForm({ initialValues: makeMealValues() }) as unknown as MealForm;

export const useMealForm = vi.fn(mealForm);

export const useMealFormContext = vi.fn(mealForm);

export const MealFormProvider = vi.fn(
	({ children }: { form: MealForm; children: ReactNode }) => children,
);

export const useMealDishes = vi.fn(() => makeMealDishes());

export const newMealValues = vi.fn(() => makeMealValues());

export const hasRequiredFields = vi.fn(() => true);

export const isNamelessDish = vi.fn(() => false);
