'use client';

import type { ReactElement } from 'react';

import { Affix, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useCalendarContext } from '@/_components/Calendar';
import { useCanWrite } from '@/app/[planner]/_components';

import { useCalendarModal } from '../CalendarModal';

export function MobileAddMealButton(): ReactElement | null {
	const canWrite = useCanWrite();
	const { selectedDate } = useCalendarContext();
	const { open, state } = useCalendarModal();

	if (!canWrite) {
		return null;
	}
	// The mobile full-screen modal does not cover this fixed-position FAB, so the
	// button must be removed from the DOM while any modal is open. If this overlap
	// appears elsewhere in the app, pursue a root-cause fix (e.g., z-index or
	// stacking context) rather than copying this guard.
	if (state.type !== null) {
		return null;
	}

	return (
		<Affix position={{ bottom: 20, right: 20 }}>
			<Button
				color="ember"
				size="lg"
				radius="xl"
				leftSection={<IconPlus />}
				data-testid="mobile-add-meal-button"
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
