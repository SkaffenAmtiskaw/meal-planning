/* v8 ignore start */
import type { HydratedDocument } from 'mongoose';

import type { PlannerInterface } from '@/_models/planner';
import type { BookmarkInterface } from '@/_models/planner/bookmark';

type Props = {
	planner: HydratedDocument<PlannerInterface>;
	item?: BookmarkInterface;
};

// biome-ignore lint/correctness/noUnusedFunctionParameters: TODO: WIP - This parameter should be used when the bookmark form is complete.
export const BookmarkForm = ({ item }: Props) => 'I am a bookmark form';
/* v8 ignore stop */
