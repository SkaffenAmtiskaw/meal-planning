import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

export const zBookmarkInterface = z.object({
	_id: zId,
	name: z.string().min(1, { error: 'Name is required' }),
	url: z.url({ error: 'URL is required' }),
	tags: z.array(zId),
	notes: zOptionalNonEmptyString,
	// Set by the server when a saved meal links the bookmark; left out until then.
	lastUsed: z.date().optional(),
});

export type BookmarkInterface = z.infer<typeof zBookmarkInterface>;
