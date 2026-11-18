import type { DishInterface } from '@/_models/types';

import type { SavedItem } from '../_types/savedItem';

/** A dish to show, with a saved-item source resolved to the item's url, or to its `_id` when it has none. */
export type ResolvedDish = Omit<DishInterface, '_id' | 'source'> & {
	source?: DishInterface['source'] | { _id: string };
};

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
