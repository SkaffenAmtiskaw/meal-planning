'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import type { DishInterface, MealInterface } from '@/_models/calendar';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { zAddMealInput } from './mealInput';

export const addMeal = defineMutation({
	schema: zAddMealInput,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.calendar(input.plannerId)],
	handler: async ({ plannerId, date, mealName, description, dishes }) => {
		// The driver stores an undefined field as null, so an empty optional field
		// gets no key at all.
		const mealDishes = dishes.map((dish): DishInterface => {
			let source: DishInterface['source'];
			if (dish.source?.kind === 'saved') {
				source = dish.source.savedId;
			} else if (dish.source?.kind === 'reference') {
				const { text } = dish.source;
				source = z.url().safeParse(text).success
					? { url: text }
					: { ref: text };
			}
			return {
				_id: newId(),
				name: dish.name,
				...(source ? { source } : {}),
				...(dish.note ? { note: dish.note } : {}),
			};
		});

		const meal: MealInterface = {
			_id: newId(),
			name: mealName,
			...(description ? { description } : {}),
			dishes: mealDishes,
		};

		const onExistingDay = await planners.updateOne(
			{ _id: plannerId, 'calendar.date': date },
			{ $push: { 'calendar.$.meals': meal } },
		);

		if (onExistingDay.matchedCount === 0) {
			// A day's date is unique within a planner, so the new day goes in only if no day has that date.
			const onNewDay = await planners.updateOne(
				{ _id: plannerId, 'calendar.date': { $ne: date } },
				{ $push: { calendar: { date, meals: [meal] } } },
			);
			if (onNewDay.matchedCount === 0)
				return { ok: false, error: 'Planner not found' };
		}

		return { ok: true, data: undefined };
	},
});
