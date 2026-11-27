'use client';

import { createFormContext, schemaResolver } from '@mantine/form';

import { zMealValues } from './mealValues';
import type { MealValues } from './types';

const [MealFormProvider, useMealFormContext, useMealFormBase] =
	createFormContext<MealValues>();

// Only the provider and the context hook leave this file, so the form is always made through useMealForm.
export { MealFormProvider, useMealFormContext };

/**
 * The meal form's values in Mantine Form. The frame that shows the form creates
 * it, so the frame can read it too, such as the date in Add Meal's header.
 * Controlled, because the dish count, the Added marks and Add Meal's button
 * change as the values do.
 */
export const useMealForm = (initialValues: MealValues) =>
	useMealFormBase({
		mode: 'controlled',
		initialValues,
		validate: schemaResolver(zMealValues),
		// A stopped save's errors stay until the next save. A row shows its mark only while its dish is still nameless.
		clearInputErrorOnChange: false,
	});

export type MealForm = ReturnType<typeof useMealForm>;
