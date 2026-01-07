import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import { zObjectId } from '../_utils/zObjectId';

export const zBookmarkInterface = z.object({
	_id: zObjectId,
	name: z.string(),
	url: z.url(),
	tags: z.array(zObjectId),
});

export type BookmarkInterface = z.infer<typeof zBookmarkInterface>;

export const bookmarkSchema = new Schema<BookmarkInterface>({
	_id: SchemaTypes.ObjectId,
	name: String,
	url: String,
	tags: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Tag',
		},
	],
});
