'use client';

import { useState } from 'react';

type Handlers = {
	openList: (key: string) => void;
	closeList: () => void;
};

/**
 * The dish whose saved list is open on a phone, or null. Follows useEditMode's
 * shape. Opening one row's list closes any other.
 */
export const useOpenDishList = (): [string | null, Handlers] => {
	const [openListKey, setOpenListKey] = useState<string | null>(null);

	return [
		openListKey,
		{ openList: setOpenListKey, closeList: () => setOpenListKey(null) },
	];
};
