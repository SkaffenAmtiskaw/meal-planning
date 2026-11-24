import type { DishDraft } from '../types';

// The saved recipes already on the meal, which the form shows as added.
export const linkedItemIds = (dishes: DishDraft[]): ReadonlySet<string> =>
	new Set(
		dishes.flatMap((dish) =>
			dish.source?.kind === 'saved' ? [dish.source.savedId] : [],
		),
	);
