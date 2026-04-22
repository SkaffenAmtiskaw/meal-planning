'use client';

import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealForm } from '../AddMealForm/AddMealForm';

type Props = {
	plannerId?: string;
	onMealAdded?: (calendar: SerializedDay[]) => void;
};

export const AddMealButton = ({ plannerId = '', onMealAdded }: Props) => {
	const canWrite = useCanWrite();
	const [opened, handlers] = useDisclosure(false);

	if (!canWrite) {
		return null;
	}

	return (
		<>
			<Button
				color="ember"
				data-testid="add-meal-button"
				leftSection={<IconPlus />}
				onClick={handlers.open}
			>
				Add Meal
			</Button>
			<Modal
				opened={opened}
				onClose={handlers.close}
				title="Add Meal"
				size="lg"
			>
				<AddMealForm
					plannerId={plannerId}
					onClose={handlers.close}
					onMealAdded={onMealAdded}
				/>
			</Modal>
		</>
	);
};
