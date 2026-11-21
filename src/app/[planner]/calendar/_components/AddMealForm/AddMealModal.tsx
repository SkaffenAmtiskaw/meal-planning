'use client';

import { useState } from 'react';

import { Modal, Stack, Text } from '@mantine/core';

import { useIsMobile } from '@/_hooks';

import { AddMealForm } from './AddMealForm';
import classes from './AddMealModal.module.css';

import type { CalendarModalFrameProps } from '../CalendarModal/types';

export function AddMealModal({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'add_meal'>) {
	const isMobile = useIsMobile();

	return (
		<Modal.Root
			opened={data !== null}
			onClose={close}
			size="xl"
			fullScreen={isMobile}
			radius={isMobile ? 0 : undefined}
			transitionProps={
				isMobile ? { transition: 'fade', duration: 200 } : undefined
			}
		>
			<Modal.Overlay />
			{data !== null && (
				<AddMealContent
					initialDate={data.initialDate}
					close={close}
					plannerId={plannerId}
				/>
			)}
		</Modal.Root>
	);
}

/**
 * The open modal's box. It mounts on each open, so the subtitle the form sets
 * starts empty every time.
 */
function AddMealContent({
	initialDate,
	close,
	plannerId,
}: {
	initialDate?: string;
	close: () => void;
	plannerId: string;
}) {
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
				<Modal.CloseButton aria-label="Close" />
			</Modal.Header>
			<Modal.Body className={classes.modalBody}>
				<AddMealForm
					plannerId={plannerId}
					initialDate={initialDate}
					onCancel={close}
					onSuccess={close}
					onSubtitleChange={setSubtitle}
				/>
			</Modal.Body>
		</Modal.Content>
	);
}
