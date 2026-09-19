import type { DateTime } from 'luxon';

import { formatWeekRange } from './formatWeekRange';

import type { CalendarViewType } from '../CalendarContext';

export const VIEW_LABELS: Record<CalendarViewType, string> = {
	list: 'List',
	month: 'Month',
	week: 'Week',
};

export const DEFAULT_VIEWS: CalendarViewType[] = ['month', 'week', 'list'];

const formatMonthLabel = (date: DateTime): string => date.toFormat('MMMM yyyy');

export const LABEL_FORMATTERS: Record<
	CalendarViewType,
	(date: DateTime) => string
> = {
	list: formatMonthLabel,
	month: formatMonthLabel,
	week: formatWeekRange,
};
