import { z } from 'zod';

import { TAG_COLOR_NAMES } from '@/_theme/colors';
import { zObjectId } from '@/_utils/zObjectId';

export const zTagInterface = z.object({
	_id: zObjectId,
	name: z.string(),
	color: z.enum(TAG_COLOR_NAMES),
});

export type TagInterface = z.infer<typeof zTagInterface>;
