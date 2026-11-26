import type { DishSource } from './types';

// The saved recipes and bookmarks a meal's dishes link, each once. A reference links nothing.
export const linkedSavedIds = (
	dishes: { source?: DishSource | null }[],
): string[] => [
	...new Set(
		dishes.flatMap((dish) =>
			dish.source?.kind === 'saved' ? [dish.source.savedId] : [],
		),
	),
];
