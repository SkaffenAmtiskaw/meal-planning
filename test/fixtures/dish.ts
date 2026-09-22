import type { DishState } from '@/app/[planner]/calendar/_components/AddMealForm/types';

export const makeDish = (overrides: Partial<DishState> = {}): DishState => ({
	id: overrides.id ?? 'dish-1',
	name: overrides.name ?? '',
	sourceType: overrides.sourceType ?? 'none',
	savedId: overrides.savedId ?? '',
	sourceText: overrides.sourceText ?? '',
	note: overrides.note ?? '',
	expanded: overrides.expanded ?? false,
});
