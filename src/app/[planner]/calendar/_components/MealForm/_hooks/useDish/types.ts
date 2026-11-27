import type { ReactNode } from 'react';

import type { DishValues } from '../../../_hooks/useMealForm';

// What DishProvider gives a row: its dish and where it sits in the form's values.
export type DishRowValue = {
	dish: DishValues;
	// Its place in the form's dishes, for paths such as `dishes.2.note`.
	index: number;
};

// What useDish() gives a piece inside a dish row.
export type Dish = DishRowValue & {
	// What a stopped save said about this dish, while it's still nameless.
	nameError: ReactNode | null;
};
