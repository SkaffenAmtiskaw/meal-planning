import { z } from 'zod';

import { zObjectId } from './utils/zObjectId';

export const zUserInterface = z.object({
	email: z.string(),
	planners: z.array(zObjectId),
});

export type UserInterface = z.infer<typeof zUserInterface>;
