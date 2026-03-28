import { Schema, SchemaTypes } from 'mongoose';

import type { BookmarkInterface } from './bookmark.types';

export * from './bookmark.types';

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
