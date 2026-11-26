'use client';

import { useRef, useState } from 'react';

import type { OpenDishList } from './types';

type Handlers = {
	// Opens the dish's list, keeping the open's id if that list is already open.
	openList: (key: string) => void;
	// Opens the dish's list as a new open, even if it's already open.
	restartList: (key: string) => void;
	closeList: () => void;
};

/**
 * The phone saved list that's open, or null: its dish, and an id for this open,
 * which a new open of the list always gets. Follows useEditMode's shape.
 * Opening one row's list closes any other.
 */
export const useOpenDishList = (): [OpenDishList | null, Handlers] => {
	const [openDishList, setOpenDishList] = useState<OpenDishList | null>(null);
	const lastId = useRef(0);

	const restartList = (key: string) => {
		lastId.current += 1;
		setOpenDishList({ key, id: lastId.current });
	};

	const openList = (key: string) => {
		if (openDishList?.key !== key) {
			restartList(key);
		}
	};

	return [
		openDishList,
		{ openList, restartList, closeList: () => setOpenDishList(null) },
	];
};
