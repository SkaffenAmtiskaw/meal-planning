import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

import { zDayInterface } from '../calendar/day.types';
import { zBookmarkInterface } from '../library/bookmark.types';
import { zRecipeInterface } from '../library/recipe.types';
import { zTagInterface } from '../library/tag.types';

export const zPlannerInterface = z.object({
	_id: zId,
	name: zOptionalNonEmptyString,
	calendar: z.array(zDayInterface),
	saved: z.array(z.union([zBookmarkInterface, zRecipeInterface])),
	tags: z.array(zTagInterface),
});

export type PlannerInterface = z.infer<typeof zPlannerInterface>;
