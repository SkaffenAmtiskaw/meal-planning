'use client';

import { useState } from 'react';

import { Button, Modal, Stack } from '@mantine/core';

import { addMeal } from '@/_actions/calendar';
import type { MealInput } from '@/_actions/calendar/types';
import {
	EscapeLayersProvider,
	useEscapeLayers,
	useIsMobile,
	useSnackbar,
} from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

import classes from './AddMealModal.module.css';

import { MealForm, newMealDraft } from '../MealForm';
import type { CalendarModalFrameProps } from '../CalendarModal/types';
import { MealDateSubtitle } from '../MealDateSubtitle/MealDateSubtitle';

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
	const escapeLayers = useEscapeLayers();
	// The open form's date. Cleared on close, so the next open starts from its own date.
	const [date, setDate] = useState('');

	const handleClose = () => {
		setDate('');
		close();
	};

	// The date that went to the server, so the message matches where the meal now shows.
	const handleSuccess = (saved: MealInput) => {
		handleClose();
		show({
			message: `Added to ${formatDate(saved.date, 'shortWeekdayMonthDay')}`,
		});
	};

	return (
		<Modal.Root
			opened={data !== null}
			onClose={handleClose}
			size={1180}
			fullScreen={isMobile}
			radius={isMobile ? 0 : undefined}
			// A picker or link mode inside takes Esc first, so one Esc closes only that layer.
			closeOnEscape={!escapeLayers.anyOpen}
			transitionProps={
				isMobile ? { transition: 'fade', duration: 200 } : undefined
			}
		>
			<EscapeLayersProvider value={escapeLayers.register}>
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
									<MealDateSubtitle date={date} />
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
								onDateChange={setDate}
							/>
						</Modal.Body>
					</Modal.Content>
				)}
			</EscapeLayersProvider>
		</Modal.Root>
	);
}
