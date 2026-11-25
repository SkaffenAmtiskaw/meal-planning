import { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';

import type { MealFormStatus } from '../../MealForm';

// "Friday, November 27 · Taco Night", or whichever of the two is filled in.
export const formatMealSubtitle = ({
	date,
	mealName,
}: Pick<MealFormStatus, 'date' | 'mealName'>): string => {
	const day = DateTime.fromISO(date);
	const dateText = day.isValid ? formatDate(day, 'weekdayMonthDay') : '';
	return [dateText, mealName].filter(Boolean).join(' · ');
};
