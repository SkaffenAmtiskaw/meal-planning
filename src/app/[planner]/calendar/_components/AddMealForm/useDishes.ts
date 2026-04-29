import { useState } from 'react';

import type { DishState } from './types';

const makeDish = (): DishState => ({
	id: crypto.randomUUID(),
	name: '',
	sourceType: 'none',
	savedId: '',
	sourceText: '',
	note: '',
	noteExpanded: false,
});

export const useDishes = () => {
	const [dishes, setDishes] = useState<DishState[]>([makeDish()]);

	const addDish = () => setDishes((prev) => [...prev, makeDish()]);

	const removeDish = (id: string) =>
		setDishes((prev) => prev.filter((d) => d.id !== id));

	const updateDish = (id: string, patch: Partial<DishState>) =>
		setDishes((prev) =>
			prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
		);

	return { dishes, addDish, removeDish, updateDish };
};
