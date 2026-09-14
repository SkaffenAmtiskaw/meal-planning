'use client';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';
import { ControlledModal } from '../ControlledModal/ControlledModal';

type Props = {
	plannerId?: string;
	onMealAdded?: (calendar: SerializedDay[]) => void;
};

export const AddMealButton = ({ plannerId = '', onMealAdded }: Props) => {
	const canWrite = useCanWrite();

	if (!canWrite) {
		return null;
	}

	return (
		<ControlledModal
			modalProps={{ title: 'Add Meal', size: 'lg' }}
			trigger={({ onOpen }) => (
				<Button
					color="ember"
					data-testid="add-meal-button"
					leftSection={<IconPlus />}
					onClick={onOpen}
				>
					Add Meal
				</Button>
			)}
		>
			{({ onClose }) => (
				<AddMealFormModalWrapper
					plannerId={plannerId}
					onMealAdded={onMealAdded}
					onClose={onClose}
				/>
			)}
		</ControlledModal>
	);
};
