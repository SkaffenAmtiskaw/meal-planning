'use client';

import type { ReactElement } from 'react';

import type { SavedItem } from '@/_actions/library/types';
import { SnackbarProvider } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { CalendarViewContent } from './CalendarViewContent';

import { CalendarProvider } from '../Calendar';
import { CalendarModalProvider, CalendarModals } from '../CalendarModal';
import { CalendarDaysProvider } from '../../_hooks/useCalendarMeals';
import { PlannerSavedItemsProvider } from '../../_hooks/usePlannerSavedItems';

type Props = {
	plannerId: string;
	calendar: DayInterface[];
	savedItems: SavedItem[];
};

/**
 * Mounts the calendar's providers around its content and modals. The
 * confirmation bar's provider wraps the modals, so a message they show
 * outlives them.
 */
export function CalendarView({
	plannerId,
	calendar,
	savedItems,
}: Props): ReactElement {
	return (
		<PlannerSavedItemsProvider savedItems={savedItems}>
			<CalendarDaysProvider calendar={calendar}>
				<CalendarProvider>
					<SnackbarProvider>
						<CalendarModalProvider>
							<CalendarViewContent plannerId={plannerId} />
							<CalendarModals plannerId={plannerId} />
						</CalendarModalProvider>
					</SnackbarProvider>
				</CalendarProvider>
			</CalendarDaysProvider>
		</PlannerSavedItemsProvider>
	);
}
