'use client';

import type { ReactElement } from 'react';

import { Affix, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useToday } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';
import { useCanWrite } from '@/app/[planner]/_components';

import { useCalendarContext } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';

// The phone calendar's floating Add Meal button, which opens Add Meal with the selected day filled in.
export function MobileAddMealButton(): ReactElement | null {
	const canWrite = useCanWrite();
	const { selectedDate } = useCalendarContext();
	const { open, state } = useCalendarModal();
	const { isKnown } = useToday();
	// The selected day starts on today, so until today is known the button can't say which day it adds to.
	const dayIsKnown = isKnown('day');

	if (!canWrite) {
		return null;
	}
	/**
	 * The mobile full-screen modal does not cover this fixed-position FAB, so the
	 * button must be removed from the DOM while any modal is open. If this overlap
	 * appears elsewhere in the app, pursue a root-cause fix (e.g., z-index or
	 * stacking context) rather than copying this guard.
	 */
	if (state.type !== null) {
		return null;
	}

	return (
		<Affix position={{ bottom: 20, right: 20 }}>
			<Button
				variant="cta"
				size="lg"
				radius="xl"
				leftSection={<IconPlus />}
				data-testid="mobile-add-meal-button"
				disabled={!dayIsKnown}
				aria-label={
					dayIsKnown
						? `Add meal for ${formatDate(selectedDate, 'weekdayMonthDay')}`
						: undefined
				}
				onClick={() =>
					open('add_meal', {
						initialDate: selectedDate.toISODate() ?? undefined,
					})
				}
			>
				Add Meal
			</Button>
		</Affix>
	);
}
