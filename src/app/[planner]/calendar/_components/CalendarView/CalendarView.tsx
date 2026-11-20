'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { Flex, Stack } from '@mantine/core';

import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { CalendarProvider, useCalendarContext } from '../Calendar';
import { CalendarModalProvider } from '../CalendarModal';
import type { CalendarMeal } from '../Calendar';
import { PlannerSavedItemsProvider } from '../../_hooks/usePlannerSavedItems';
import type { SavedItem } from '../../types';
import {
	CalendarHeaderDesktop,
	CalendarHeaderMobile,
} from '../CalendarHeader/CalendarHeader';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

type Props = {
	plannerId: string;
	calendar: DayInterface[];
	savedItems: SavedItem[];
};

type CalendarViewContentProps = {
	plannerId: string;
	savedItems: SavedItem[];
	calendar: DayInterface[];
	clickedMeal: CalendarMeal | null;
	onClose: () => void;
	onMealClick: (meal: CalendarMeal) => void;
};

function CalendarViewContent({
	plannerId,
	savedItems,
	calendar,
	clickedMeal,
	onClose,
	onMealClick,
}: CalendarViewContentProps): ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useIsMobile();

	return (
		<Stack gap={0} h="100%">
			<MealDetailModal
				meal={clickedMeal}
				plannerId={plannerId}
				onClose={onClose}
			/>
			{isMobile ? <CalendarHeaderMobile /> : <CalendarHeaderDesktop />}
			<Flex flex={1} mih={0} direction="column">
				{viewType === 'month' &&
					(isMobile ? (
						<MealMonthAgenda
							plannerId={plannerId}
							calendar={calendar}
							savedItems={savedItems}
						/>
					) : (
						<MealCalendar
							calendar={calendar}
							savedItems={savedItems}
							onMealClick={onMealClick}
						/>
					))}
				{viewType === 'week' && (
					<MealWeekView
						calendar={calendar}
						savedItems={savedItems}
						plannerId={plannerId}
						onMealClick={onMealClick}
					/>
				)}
				{viewType === 'list' && (
					<MealListView
						plannerId={plannerId}
						calendar={calendar}
						savedItems={savedItems}
					/>
				)}
			</Flex>
		</Stack>
	);
}

export function CalendarView({
	plannerId,
	calendar,
	savedItems,
}: Props): ReactElement {
	const [clickedMeal, setClickedMeal] = useState<CalendarMeal | null>(null);

	return (
		<PlannerSavedItemsProvider savedItems={savedItems}>
			<CalendarProvider>
				<CalendarModalProvider plannerId={plannerId}>
					<CalendarViewContent
						plannerId={plannerId}
						savedItems={savedItems}
						calendar={calendar}
						clickedMeal={clickedMeal}
						onClose={() => setClickedMeal(null)}
						onMealClick={setClickedMeal}
					/>
				</CalendarModalProvider>
			</CalendarProvider>
		</PlannerSavedItemsProvider>
	);
}
