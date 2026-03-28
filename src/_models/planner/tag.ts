import { Schema } from 'mongoose';

import type { TagInterface } from './tag.types';

export * from './tag.types';

export const tagSchema = new Schema<TagInterface>({
	name: { type: String, required: true },
	color: { type: String, required: true },
});
