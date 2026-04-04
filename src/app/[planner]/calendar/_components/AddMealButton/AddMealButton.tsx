'use client';

import { useState } from 'react';

import { Button, Modal } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealForm } from '../AddMealForm/AddMealForm';

type Props = {
	plannerId?: string;
	savedItems?: SavedItem[];
	onMealAdded?: (calendar: SerializedDay[]) => void;
};

export const AddMealButton = ({
	plannerId = '',
	savedItems = [],
	onMealAdded,
}: Props) => {
	const [opened, setOpened] = useState(false);

	return (
		<>
			<Button
				data-testid="add-meal-button"
				leftSection={<IconPlus />}
				onClick={() => setOpened(true)}
			>
				Add Meal
			</Button>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Add Meal"
				size="lg"
			>
				<AddMealForm
					plannerId={plannerId}
					savedItems={savedItems}
					onClose={() => setOpened(false)}
					onMealAdded={onMealAdded}
				/>
			</Modal>
		</>
	);
};
