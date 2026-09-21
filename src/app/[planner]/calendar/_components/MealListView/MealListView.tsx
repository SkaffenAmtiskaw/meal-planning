'use client';

import { useMemo } from 'react';
import type { ReactElement } from 'react';

import type { CalendarDish, CalendarMeal } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';

import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { DishLink } from '../DishLink/DishLink';
import { ListView } from '../ListView/ListView';
import { MobileListViewPlaceholder } from '../MobileListViewPlaceholder/MobileListViewPlaceholder';

export interface MealListViewProps {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
}

export function MealListView({
	plannerId,
	calendar,
	savedItems = [],
}: MealListViewProps): ReactElement {
	const isMobile = useIsMobile();

	const events: CalendarMeal[] = useMemo(
		() => toCalendarMeals(toCalendarEvents(calendar, savedItems)),
		[calendar, savedItems],
	);

	if (isMobile) {
		return <MobileListViewPlaceholder />;
	}

	const renderDish = (dish: CalendarDish) => (
		<DishLink dish={dish} plannerId={plannerId} size="sm" />
	);

	return <ListView events={events} renderDish={renderDish} />;
}
