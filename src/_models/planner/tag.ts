import { Schema } from 'mongoose';
import { z } from 'zod';

export const zTagInterface = z.object({
	name: z.string(),
	color: z.string(),
});

export type TagInterface = z.infer<typeof zTagInterface>;

export const tagSchema = new Schema<TagInterface>({
	name: { type: String, required: true },
	color: { type: String, required: true },
});
