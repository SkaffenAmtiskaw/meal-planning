import type { SavedItem } from '@/_actions/library/types';

import { hasBeenUsed } from '../../../_utils/hasBeenUsed';

/**
 * The phone list's title. It names the selected tags in pick order while any
 * are selected. Otherwise, while nothing is typed and the rows shown are used
 * ones, it says they're recently used. SectionLabel shows it in capitals.
 */
export const phoneListTitle = ({
	search,
	selectedTagNames,
	rows,
}: {
	search: string;
	selectedTagNames: string[];
	rows: SavedItem[];
}): string => {
	if (selectedTagNames.length > 0) {
		return `Saved · ${selectedTagNames.join(' + ')}`;
	}
	return search.trim() === '' && rows.some(hasBeenUsed)
		? 'Recently used'
		: 'From your saved recipes';
};
