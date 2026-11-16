'use server';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import type { DishInterface, MealInterface } from '@/_models/calendar';
import { zMealFormSchema } from '@/_models/calendar';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { ActionResult } from '@/_utils/actionResult';

export const addMeal = async (
	data: unknown,
): Promise<ActionResult<{ calendar: unknown }>> => {
	const { plannerId, date, mealName, description, dishes } =
		zMealFormSchema.parse(data);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	// The driver stores an undefined field as null, so an empty optional field
	// gets no key at all.
	const mealDishes = dishes.map((dish): DishInterface => {
		let source: DishInterface['source'];
		if (dish.sourceType === 'saved' && dish.savedId) {
			source = dish.savedId;
		} else if (dish.sourceType === 'text' && dish.sourceText) {
			const isUrl = z.url().safeParse(dish.sourceText).success;
			source = isUrl ? { url: dish.sourceText } : { ref: dish.sourceText };
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

	const updated = await planners.findOne({ _id: plannerId });

	return { ok: true, data: { calendar: updated?.calendar ?? [] } };
};
