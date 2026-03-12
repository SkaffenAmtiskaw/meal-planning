import type { HydratedDocument } from 'mongoose';

import type { PlannerInterface } from '@/_models/planner';
import type { BookmarkInterface } from '@/_models/planner/bookmark';

type Props = {
	planner: HydratedDocument<PlannerInterface>;
	item?: BookmarkInterface;
};

export const BookmarkForm = ({ item }: Props) => 'I am a bookmark form';
