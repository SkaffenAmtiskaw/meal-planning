import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

export const zBookmarkInterface = z.object({
	_id: zId,
	name: z.string().min(1, { error: 'Name is required' }),
	url: z.url({ error: 'URL is required' }),
	tags: z.array(zId),
	notes: zOptionalNonEmptyString,
});

// The form starts notes at '', and the action leaves it out before it writes.
export const zBookmarkFormSchema = zBookmarkInterface
	.omit({ _id: true })
	.extend({
		plannerId: z.string(),
		notes: z.string().optional(),
	});

export type BookmarkInterface = z.infer<typeof zBookmarkInterface>;
