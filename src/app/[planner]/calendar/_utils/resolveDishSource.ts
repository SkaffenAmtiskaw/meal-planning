import type { DishInterface } from '@/_models/types';

import type { ResolvedDish } from './types';

import type { SavedItem } from '../types';

export const resolveDishSource = (
	dish: DishInterface,
	savedMap: Map<string, SavedItem>,
): ResolvedDish => {
	if (typeof dish.source === 'string') {
		const saved = savedMap.get(dish.source);
		if (saved) {
			return {
				...dish,
				source: 'url' in saved ? { url: saved.url } : { _id: saved._id },
			};
		}
	}
	return dish;
};
