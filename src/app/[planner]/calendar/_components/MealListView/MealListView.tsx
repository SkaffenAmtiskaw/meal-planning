'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type { DateTime } from 'luxon';

import { ListView } from '@/_components/Calendar';
import { useCanWrite } from '@/app/[planner]/_components';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';

export interface MealListViewProps {
	plannerId: string;
	onMealAdded: (calendar: SerializedDay[]) => void;
}

export function MealListView({
	plannerId,
	onMealAdded,
}: MealListViewProps): ReactElement {
	const canWrite = useCanWrite();
	const [opened, { open, close }] = useDisclosure(false);
	const [dateForAdd, setDateForAdd] = useState<DateTime | null>(null);

	const handleAddMeal = canWrite
		? (date: DateTime) => {
				setDateForAdd(date);
				open();
			}
		: undefined;

	return (
		<>
			<ListView onAddMeal={handleAddMeal} />
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
