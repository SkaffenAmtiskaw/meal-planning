'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type { DateTime } from 'luxon';

import { ListView } from '@/_components/Calendar';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import { useCanWrite } from '@/app/[planner]/_components';

import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';

export interface MealListViewProps {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
	onMealAdded: (calendar: SerializedDay[]) => void;
}

export function MealListView({
	plannerId,
	calendar,
	savedItems = [],
	onMealAdded,
}: MealListViewProps): ReactElement {
	const canWrite = useCanWrite();
	const [opened, { open, close }] = useDisclosure(false);
	const [dateForAdd, setDateForAdd] = useState<DateTime | null>(null);

	const events = useMemo(() => {
		const calendarEvents = toCalendarEvents(calendar, savedItems);

		return calendarEvents.map((event) => ({
			id: event.id,
			date: event.start,
			name: event.title,
			description: event.description,
			borderColor: TAG_COLORS[getMealColor(event.title)].border,
			dishes: event.dishes,
		}));
	}, [calendar, savedItems]);

	const handleAddMeal = canWrite
		? (date: DateTime) => {
				setDateForAdd(date);
				open();
			}
		: undefined;

	return (
		<>
			<ListView events={events} onAddMeal={handleAddMeal} />
			<Modal opened={opened} onClose={close} title="Add Meal" size="lg">
				<AddMealFormModalWrapper
					plannerId={plannerId}
					initialDate={dateForAdd?.toISODate() ?? undefined}
					onMealAdded={onMealAdded}
					onClose={close}
				/>
			</Modal>
		</>
	);
}
