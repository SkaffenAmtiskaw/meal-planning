import { Schema } from 'mongoose';

import type { BookmarkInterface } from './bookmark.types';

export * from './bookmark.types';

export const bookmarkSchema = new Schema<BookmarkInterface>(
	{
		_id: { type: String, required: true },
		name: String,
		url: String,
		tags: [String],
		notes: String,
	},
	{ strict: false },
);
