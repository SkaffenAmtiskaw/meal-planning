import type { DateTime } from 'luxon';

import { getWeekStart } from '@/_utils/weekStart';

import type { TodayPeriod } from './types';

const isSamePeriod = (
	a: DateTime,
	b: DateTime,
	period: TodayPeriod,
): boolean =>
	period === 'week'
		? getWeekStart(a).equals(getWeekStart(b))
		: a.hasSame(b, period);

/**
 * Builds `ViewerDay.isKnown` from the days today could be: a period is known
 * when every one of them falls in the same one.
 */
export const makeIsKnown =
	(possibleDays: readonly DateTime[]) =>
	(period: TodayPeriod): boolean => {
		const [first] = possibleDays;
		return possibleDays.every((day) => isSamePeriod(day, first, period));
	};
