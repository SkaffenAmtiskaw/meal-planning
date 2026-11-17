import { z } from 'zod';

import { TAG_COLOR_NAMES } from '@/_theme/colors';
import { zId } from '@/_utils/zId';

export const zTagInterface = z.object({
	_id: zId,
	name: z.string(),
	color: z.enum(TAG_COLOR_NAMES),
});

export type TagInterface = z.infer<typeof zTagInterface>;
