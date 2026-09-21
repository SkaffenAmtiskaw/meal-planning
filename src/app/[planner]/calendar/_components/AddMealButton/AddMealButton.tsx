'use client';

import type { ReactElement } from 'react';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

import { useCalendarModal } from '../CalendarModal';

export function AddMealButton(): ReactElement | null {
	const canWrite = useCanWrite();
	const { open } = useCalendarModal();

	if (!canWrite) {
		return null;
	}

	return (
		<Button
			color="ember"
			data-testid="add-meal-button"
			leftSection={<IconPlus />}
			onClick={() => open('add_meal', {})}
		>
			Add Meal
		</Button>
	);
}
