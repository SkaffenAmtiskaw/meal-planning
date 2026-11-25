import type { TagFilterOption } from '@/app/[planner]/calendar/_components/MealForm/_utils/types';

// A tag filter chip for a tag named and keyed `name`, carried by one result while unselected.
export const makeTagFilterOption = (
	name: string,
	selected = false,
): TagFilterOption => {
	const tag = { _id: name, name, color: 'fern' as const };
	return selected ? { tag, selected } : { tag, selected, count: 1 };
};
