'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Modal, Stack, Text } from '@mantine/core';

import { AddMealForm } from './AddMealForm';
import classes from './AddMealModal.module.css';

export interface AddMealModalProps {
	data: { initialDate?: string };
	close: () => void;
	plannerId: string;
}

export function AddMealModal({ data, close, plannerId }: AddMealModalProps) {
	const router = useRouter();
	const [subtitle, setSubtitle] = useState('');

	return (
		<Modal.Content className={classes.modalContent}>
			<Modal.Header>
				<Stack gap={0}>
					<Modal.Title>Add Meal</Modal.Title>
					{subtitle && (
						<Text size="sm" c="dimmed" data-testid="modal-subtitle">
							{subtitle}
						</Text>
					)}
				</Stack>
				<Modal.CloseButton />
			</Modal.Header>
			<Modal.Body className={classes.modalBody}>
				<AddMealForm
					plannerId={plannerId}
					initialDate={data.initialDate}
					onCancel={close}
					onSuccess={() => {
						close();
						router.refresh();
					}}
					onSubtitleChange={setSubtitle}
				/>
			</Modal.Body>
		</Modal.Content>
	);
}
