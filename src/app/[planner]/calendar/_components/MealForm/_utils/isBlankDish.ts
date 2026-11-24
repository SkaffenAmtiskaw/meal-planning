import type { DishDraft } from '../types';

// A row with nothing in it, which a save drops and the dish counts skip. Spaces count as nothing.
export const isBlankDish = ({ name, source, note }: DishDraft): boolean =>
	name.trim() === '' && source === null && note.trim() === '';
