'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type { DateTime } from 'luxon';

import type { ListViewDish, ListViewEvent } from '@/_components/Calendar';
import { ListView } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import { useCanWrite } from '@/app/[planner]/_components';

import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';
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
	const [opened, { open, close }] = useDisclosure(false);
	const [dateForAdd, setDateForAdd] = useState<DateTime | null>(null);

	const events: ListViewEvent[] = useMemo(() => {
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

	if (isMobile) {
		return <MobileListViewPlaceholder />;
	}

	const renderDish = (dish: ListViewDish) => (
		<DishLink dish={dish} plannerId={plannerId} size="sm" />
	);

	const handleAddMeal = canWrite
		? (date: DateTime) => {
				setDateForAdd(date);
				open();
			}
		: undefined;

	return (
		<>
			<ListView
				events={events}
				onAddMeal={handleAddMeal}
				renderDish={renderDish}
			/>
			<Modal opened={opened} onClose={close} title="Add Meal" size="lg">
				<AddMealFormModalWrapper
					plannerId={plannerId}
					initialDate={dateForAdd?.toISODate() ?? undefined}
					onClose={close}
				/>
			</Modal>
		</>
	);
}
