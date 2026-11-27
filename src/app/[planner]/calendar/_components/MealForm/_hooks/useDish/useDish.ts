import { useContext } from 'react';

import { DishContext } from './DishContext';
import type { Dish } from './types';

import {
	isNamelessDish,
	useMealFormContext,
} from '../../../_hooks/useMealForm';

/**
 * The dish a row shows, where it sits in the form's values, and the message a
 * stopped save left on it. The message shows only while the dish is still
 * nameless, so naming the dish hides it and clearing the name brings it back.
 */
export const useDish = (): Dish => {
	const row = useContext(DishContext);
	const form = useMealFormContext();
	if (!row) {
		throw new Error('useDish must be used inside DishProvider');
	}
	const error = form.errors[`dishes.${row.index}.name`];

	return {
		...row,
		nameError: error && isNamelessDish(row.dish) ? error : null,
	};
};
