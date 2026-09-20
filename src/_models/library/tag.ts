import { Schema } from 'mongoose';

import { TAG_COLOR_NAMES } from '@/_theme/colors';

import type { TagInterface } from './tag.types';

export * from './tag.types';

export const tagSchema = new Schema<TagInterface>({
	name: { type: String, required: true },
	color: { type: String, required: true, enum: TAG_COLOR_NAMES },
});
