import { z } from 'zod';

import { zBookmarkInterface } from './bookmark.types';
import { zDayInterface } from './day.types';
import { zRecipeInterface } from './recipe.types';
import { zTagInterface } from './tag.types';

export const zPlannerInterface = z.object({
	calendar: z.array(zDayInterface),
	saved: z.array(z.union([zBookmarkInterface, zRecipeInterface])),
	tags: z.array(zTagInterface),
});

export type PlannerInterface = z.infer<typeof zPlannerInterface>;
