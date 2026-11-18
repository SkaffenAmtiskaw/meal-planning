import type { DishInterface } from '@/_models/types';

/** A dish to show, with a saved-item source resolved to the item's url, or to its `_id` when it has none. */
export type ResolvedDish = Omit<DishInterface, '_id' | 'source'> & {
	source?: DishInterface['source'] | { _id: string };
};
