'use client';

import { useState } from 'react';

// What the Saved recipes column is searching for. Linking a dish fills it.
export const useSavedSearch = () => {
	const [search, setSearch] = useState('');

	// Starts the search over for a dish being linked, filled with its name, so linking needs only this one call.
	const resetForLinking = (dishName: string) => setSearch(dishName);

	return { search, setSearch, resetForLinking };
};
