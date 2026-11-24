'use client';

import { useState } from 'react';

import { Button, Modal, Stack, Text } from '@mantine/core';

import { addMeal } from '@/_actions/calendar';
import { useIsMobile } from '@/_hooks';

import classes from './AddMealModal.module.css';

import { MealForm, type MealFormStatus, newMealDraft } from '../MealForm';
import type { CalendarModalFrameProps } from '../CalendarModal/types';
import { formatMealSubtitle } from './_utils/formatMealSubtitle';

/**
 * The Add Meal frame: a wide modal on desktop, and a full-screen sheet with
 * Cancel in its top bar on a phone. It closes on success, and on cancel or
 * close with no prompt.
 */
export function AddMealModal({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'add_meal'>) {
	const isMobile = useIsMobile();
	// What the open form last reported. Cleared on close, so the next open starts with no subtitle.
	const [status, setStatus] = useState<MealFormStatus | null>(null);

	const handleClose = () => {
		setStatus(null);
		close();
	};

	const subtitle = status ? formatMealSubtitle(status) : '';

	return (
		<Modal.Root
			opened={data !== null}
			onClose={handleClose}
			size={1180}
			fullScreen={isMobile}
			radius={isMobile ? 0 : undefined}
			closeOnEscape={!status?.linking}
			transitionProps={
				isMobile ? { transition: 'fade', duration: 200 } : undefined
			}
		>
			<Modal.Overlay />
			{data !== null && (
				<Modal.Content className={classes.content}>
					{isMobile ? (
						<Modal.Header className={classes.phoneHeader}>
							<Button
								variant="subtle"
								px={0}
								justify="flex-start"
								onClick={handleClose}
							>
								Cancel
							</Button>
							<Modal.Title fw={700}>Add Meal</Modal.Title>
						</Modal.Header>
					) : (
						<Modal.Header>
							<Stack gap={0}>
								<Modal.Title fw={700} fz="xl">
									Add Meal
								</Modal.Title>
								{subtitle && (
									<Text
										size="sm"
										c="var(--text-muted)"
										data-testid="modal-subtitle"
									>
										{subtitle}
									</Text>
								)}
							</Stack>
							<Modal.CloseButton aria-label="Close" />
						</Modal.Header>
					)}
					<Modal.Body className={classes.body} p={0}>
						<MealForm
							initialDraft={newMealDraft(data.initialDate)}
							save={(input) => addMeal({ plannerId, ...input })}
							onSuccess={handleClose}
							onCancel={handleClose}
							onStatusChange={setStatus}
						/>
					</Modal.Body>
				</Modal.Content>
			)}
		</Modal.Root>
	);
}
