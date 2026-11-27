import type { DishValues } from '../_hooks/useMealForm/types';

// A row with nothing in it, which a save drops and the dish counts skip. Spaces count as nothing.
export const isBlankDish = ({ name, source, note }: DishValues): boolean =>
	name.trim() === '' && source === null && note.trim() === '';
