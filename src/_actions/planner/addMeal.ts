'use server';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import { zMealFormSchema } from '@/_models/planner/day.types';
import type { ActionResult } from '@/_utils/actionResult';

export const addMeal = async (
	data: unknown,
): Promise<ActionResult<{ calendar: unknown }>> => {
	const { plannerId, date, mealName, description, dishes } =
		zMealFormSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const mealDishes = dishes.map((dish) => {
		let source: unknown;
		if (dish.sourceType === 'saved' && dish.savedId) {
			source = new Types.ObjectId(dish.savedId);
		} else if (dish.sourceType === 'text' && dish.sourceText) {
			const isUrl = z.url().safeParse(dish.sourceText).success;
			source = isUrl ? { url: dish.sourceText } : { ref: dish.sourceText };
		}
		return { name: dish.name, source, note: dish.note || undefined };
	});

	const meal = {
		name: mealName,
		description: description || undefined,
		dishes: mealDishes,
	};

	const plannerId_ = new Types.ObjectId(plannerId);

	const result = await Planner.collection.updateOne(
		{ _id: plannerId_, 'calendar.date': date },
		{ $push: { 'calendar.$.meals': meal } } as object,
	);

	if (result.matchedCount === 0) {
		await Planner.collection.updateOne({ _id: plannerId_ }, {
			$push: { calendar: { date, meals: [meal] } },
		} as object);
	}

	const updated = await Planner.findById(plannerId);
	const calendar = JSON.parse(JSON.stringify(updated?.calendar ?? []));

	return { ok: true, data: { calendar } };
};
