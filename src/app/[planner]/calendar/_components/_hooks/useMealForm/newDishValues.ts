import type { DishValues } from './types';

export const newDishValues = (): DishValues => ({
	key: crypto.randomUUID(),
	name: '',
	source: null,
	note: '',
});
