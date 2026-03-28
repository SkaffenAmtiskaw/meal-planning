import { Schema, SchemaTypes, Types } from 'mongoose';

import type { BookmarkInterface } from './bookmark.types';

export * from './bookmark.types';

export const bookmarkSchema = new Schema<BookmarkInterface>({
	_id: { type: SchemaTypes.ObjectId, default: () => new Types.ObjectId() },
	name: String,
	url: String,
	tags: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Tag',
		},
	],
});
