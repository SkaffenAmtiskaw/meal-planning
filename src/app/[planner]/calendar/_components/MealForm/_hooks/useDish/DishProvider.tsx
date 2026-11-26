'use client';

import type { ReactNode } from 'react';

import { DishContext } from './DishContext';

import type { DishDraft } from '../../types';

type Props = {
	dish: DishDraft;
	children: ReactNode;
};

// Gives a dish row, and every piece inside it, the dish it shows.
export const DishProvider = ({ dish, children }: Props) => (
	<DishContext.Provider value={dish}>{children}</DishContext.Provider>
);
