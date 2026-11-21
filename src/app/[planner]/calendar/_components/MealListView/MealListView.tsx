'use client';

import type { ReactElement } from 'react';

import { useIsMobile } from '@/_hooks';

import type { CalendarDish } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import { DishLink } from '../DishLink/DishLink';
import { ListView } from '../ListView/ListView';
import { MobileListViewPlaceholder } from '../MobileListViewPlaceholder/MobileListViewPlaceholder';

interface MealListViewProps {
	plannerId: string;
}

export function MealListView({ plannerId }: MealListViewProps): ReactElement {
	const isMobile = useIsMobile();
	const meals = useCalendarMeals();

	if (isMobile) {
		return <MobileListViewPlaceholder />;
	}

	const renderDish = (dish: CalendarDish) => (
		<DishLink dish={dish} plannerId={plannerId} size="sm" />
	);

	return <ListView meals={meals} renderDish={renderDish} />;
}
