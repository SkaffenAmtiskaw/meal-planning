import { z } from 'zod';

import { zObjectId } from '../_utils/zObjectId';

export const zTagInterface = z.object({
	_id: zObjectId,
	name: z.string(),
	color: z.string(),
});

export type TagInterface = z.infer<typeof zTagInterface>;
