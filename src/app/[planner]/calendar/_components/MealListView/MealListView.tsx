'use client';

import { useMemo } from 'react';
import type { ReactElement } from 'react';

import type { DateTime } from 'luxon';

import type { CalendarDish, CalendarMeal } from '@/_components/Calendar';
import { ListView } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';
import { useCanWrite } from '@/app/[planner]/_components';

import { useCalendarModal } from '../CalendarModal';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { DishLink } from '../DishLink/DishLink';
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
	const canWrite = useCanWrite();
	const isMobile = useIsMobile();
	const { open } = useCalendarModal();

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

	const handleAddMeal = canWrite
		? (date: DateTime) => {
				open('add_meal', { initialDate: date.toISODate() ?? undefined });
			}
		: undefined;

	return (
		<ListView
			events={events}
			onAddMeal={handleAddMeal}
			renderDish={renderDish}
		/>
	);
}
