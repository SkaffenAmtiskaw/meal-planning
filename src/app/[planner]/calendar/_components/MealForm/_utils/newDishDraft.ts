import type { DishDraft } from '../types';

export const newDishDraft = (): DishDraft => ({
	key: crypto.randomUUID(),
	name: '',
	source: null,
	note: '',
});
