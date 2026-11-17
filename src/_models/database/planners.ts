import { checkedCollection } from './checkedCollection';
import { rawDatabase } from './connection';

import type { PlannerInterface } from '../planner/planner.types';
import { zPlannerInterface } from '../planner/planner.types';

export const planners = checkedCollection(
	rawDatabase.collection<PlannerInterface>('planners'),
	zPlannerInterface,
);
