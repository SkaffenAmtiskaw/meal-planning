'use client';

import { useParams } from 'next/navigation';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';
import { ControlledModal } from '../ControlledModal/ControlledModal';

export const AddMealButton = () => {
	const params = useParams();
	const plannerId = typeof params.planner === 'string' ? params.planner : '';
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
				<AddMealFormModalWrapper plannerId={plannerId} onClose={onClose} />
			)}
		</ControlledModal>
	);
};
