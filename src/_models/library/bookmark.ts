import { Schema } from 'mongoose';

import type { BookmarkInterface } from './bookmark.types';

import { newId } from '../database/newId';

export * from './bookmark.types';

export const bookmarkSchema = new Schema<BookmarkInterface>(
	{
		// Mongoose won't save a String `_id` it isn't given, so it defaults to a new one until its creator sets it.
		_id: { type: String, default: newId },
		name: String,
		url: String,
		tags: [String],
		notes: String,
	},
	{ strict: false },
);
