'use client';

import { useState } from 'react';

/**
 * What the Saved recipes column is searching for. Linking a dish fills it, and
 * the tag filter keeps its selected tags here too.
 */
export const useSavedSearch = () => {
	const [search, setSearch] = useState('');

	/**
	 * Starts the search over for a dish being linked, filled with its name. The
	 * tag filter clears its tags here too, so linking needs only this one call.
	 */
	const resetForLinking = (dishName: string) => setSearch(dishName);

	return { search, setSearch, resetForLinking };
};
