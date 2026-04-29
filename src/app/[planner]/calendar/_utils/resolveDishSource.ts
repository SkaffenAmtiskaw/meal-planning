import type { SavedItem, SerializedDish } from './toScheduleXEvents';

export const resolveDishSource = (
	dish: SerializedDish,
	savedMap: Map<string, SavedItem>,
): SerializedDish => {
	if (typeof dish.source === 'string') {
		const saved = savedMap.get(dish.source);
		if (saved) {
			return {
				...dish,
				source: saved.url ? { url: saved.url } : { _id: saved._id },
			};
		}
	}
	return dish;
};
