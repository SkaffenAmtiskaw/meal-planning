'use client';

import { useState } from 'react';

import type { DishValues } from '../../../_hooks/useMealForm';
import type { SavedItemCriteria } from '../../_utils/types';

type Handlers = {
	setSearch: (search: string) => void;
	setTagIds: (tagIds: string[]) => void;
};

// The dish being linked, of which the hook reads only its key and name.
type LinkingDish = Pick<DishValues, 'key' | 'name'> | null;

// The search filled with the dish's name, or empty with no dish, and no tags selected.
const startFor = (dish: LinkingDish): SavedItemCriteria => ({
	search: dish?.name ?? '',
	tagIds: [],
});

/**
 * What the Saved recipes column is narrowed by. Follows useLinkMode's shape.
 * Whenever the dish being linked changes, whether linking starts, ends or moves
 * to another dish, the search starts over from that dish's name and the tags
 * clear, so an old filter doesn't hide the likely match. It follows the dish's
 * key rather than its name, since the name stays editable while linking.
 */
export const useSavedItemCriteria = (
	linkingDish: LinkingDish,
): [SavedItemCriteria, Handlers] => {
	const linkingKey = linkingDish?.key ?? null;
	const [criteria, setCriteria] = useState(() => startFor(linkingDish));

	// Set while rendering, as React's docs advise for state that follows a change.
	const [prevLinkingKey, setPrevLinkingKey] = useState(linkingKey);
	if (linkingKey !== prevLinkingKey) {
		setPrevLinkingKey(linkingKey);
		setCriteria(startFor(linkingDish));
	}

	const setSearch = (search: string) =>
		setCriteria((current) => ({ ...current, search }));
	const setTagIds = (tagIds: string[]) =>
		setCriteria((current) => ({ ...current, tagIds }));

	return [criteria, { setSearch, setTagIds }];
};
