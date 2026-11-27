'use client';

import type { ReactNode } from 'react';

import { DishContext } from './DishContext';
import type { DishRowValue } from './types';

type Props = DishRowValue & {
	children: ReactNode;
};

// Gives a dish row, and every piece inside it, the dish it shows and its place in the form's values.
export const DishProvider = ({ dish, index, children }: Props) => (
	<DishContext.Provider value={{ dish, index }}>
		{children}
	</DishContext.Provider>
);
