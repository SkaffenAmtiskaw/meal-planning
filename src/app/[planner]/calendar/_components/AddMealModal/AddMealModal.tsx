'use client';

import { useState } from 'react';

import { Button, Modal, Stack, Text } from '@mantine/core';

import { addMeal } from '@/_actions/calendar';
import type { MealInput } from '@/_actions/calendar/types';
import { useIsMobile, useSnackbar } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

import classes from './AddMealModal.module.css';

import { MealForm, type MealFormStatus, newMealDraft } from '../MealForm';
import type { CalendarModalFrameProps } from '../CalendarModal/types';
import { formatMealSubtitle } from './_utils/formatMealSubtitle';

/**
 * The Add Meal frame: a wide modal on desktop, and a full-screen sheet with
 * Cancel in its top bar on a phone. On success it closes and confirms the
 * save in the confirmation bar. It closes on cancel or close with no prompt.
 */
export function AddMealModal({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'add_meal'>) {
	const isMobile = useIsMobile();
	const { show } = useSnackbar();
	// What the open form last reported. Cleared on close, so the next open starts with no subtitle.
	const [status, setStatus] = useState<MealFormStatus | null>(null);

	const handleClose = () => {
		setStatus(null);
		close();
	};

	// The date that went to the server, so the message matches where the meal now shows.
	const handleSuccess = (saved: MealInput) => {
		handleClose();
		show({
			message: `Added to ${formatDate(saved.date, 'shortWeekdayMonthDay')}`,
		});
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
							onSuccess={handleSuccess}
							onCancel={handleClose}
							onStatusChange={setStatus}
						/>
					</Modal.Body>
				</Modal.Content>
			)}
		</Modal.Root>
	);
}
