import { Schema } from 'mongoose';

import { TAG_COLOR_NAMES } from '@/_theme/colors';

import type { TagInterface } from './tag.types';

import { newId } from '../database/newId';

export * from './tag.types';

export const tagSchema = new Schema<TagInterface>({
	// Mongoose won't save a String `_id` it isn't given, so it defaults to a new one until its creator sets it.
	_id: { type: String, default: newId },
	name: { type: String, required: true },
	color: { type: String, required: true, enum: TAG_COLOR_NAMES },
});
