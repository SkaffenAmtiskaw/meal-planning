'use client';

import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import type { CalendarDish, CalendarMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';
import { DishLink } from '../DishLink/DishLink';
import { ListView } from '../ListView/ListView';
import { MobileListViewPlaceholder } from '../MobileListViewPlaceholder/MobileListViewPlaceholder';

interface MealListViewProps {
	plannerId: string;
	calendar: DayInterface[];
	savedItems?: SavedItem[];
}

export function MealListView({
	plannerId,
	calendar,
	savedItems = [],
}: MealListViewProps): ReactElement {
	const isMobile = useIsMobile();

	const meals: CalendarMeal[] = useMemo(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);

	if (isMobile) {
		return <MobileListViewPlaceholder />;
	}

	const renderDish = (dish: CalendarDish) => (
		<DishLink dish={dish} plannerId={plannerId} size="sm" />
	);

	return <ListView meals={meals} renderDish={renderDish} />;
}
