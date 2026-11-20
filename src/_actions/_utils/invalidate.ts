import 'server-only';

import { updateTag } from 'next/cache';

import type { CacheTags } from './types';

/**
 * Invalidates the given tags from inside a server action. The only module that
 * imports `next/cache`. Updating a tag in a server action re-renders the current
 * route in the action's response, even while no read is cached yet.
 */
export const invalidate = (tags: CacheTags) => {
	for (const tag of tags) updateTag(tag);
};
