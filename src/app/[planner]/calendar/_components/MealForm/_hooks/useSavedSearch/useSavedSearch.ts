'use client';

import { useState } from 'react';

/**
 * What the Saved recipes column is searching for. Linking a dish fills it, and
 * the tag filter keeps its selected tags here too.
 */
export const useSavedSearch = () => {
	const [search, setSearch] = useState('');

	return { search, setSearch };
};
