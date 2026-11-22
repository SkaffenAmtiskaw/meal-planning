import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';

import { formatWeekRange } from './formatWeekRange';

import type { CalendarViewType } from '../../Calendar';

export const VIEW_LABELS: Record<CalendarViewType, string> = {
	list: 'List',
	month: 'Month',
	week: 'Week',
};

export const DEFAULT_VIEWS: CalendarViewType[] = ['month', 'week', 'list'];

const formatMonthLabel = (date: DateTime): string =>
	formatDate(date, 'monthYear');

export const LABEL_FORMATTERS: Record<
	CalendarViewType,
	(date: DateTime) => string
> = {
	list: formatMonthLabel,
	month: formatMonthLabel,
	week: formatWeekRange,
};
