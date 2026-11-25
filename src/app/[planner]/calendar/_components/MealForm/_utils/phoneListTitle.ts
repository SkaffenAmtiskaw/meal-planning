import type { SavedItemCriteria } from './types';

// The phone list's title. The tag filter names its selected tags here.
export const phoneListTitle = (_criteria: SavedItemCriteria): string =>
	'From your saved recipes';
