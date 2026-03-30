import { z } from 'zod';

import { zObjectId } from '../utils/zObjectId';

export const zBookmarkInterface = z.object({
	_id: zObjectId,
	name: z.string().min(1, 'Name is required'),
	url: z.url('URL is required'),
	tags: z.array(zObjectId),
});

export const zBookmarkFormSchema = zBookmarkInterface
	.omit({ _id: true })
	.extend({
		plannerId: z.string(),
	});

export type BookmarkInterface = z.infer<typeof zBookmarkInterface>;
