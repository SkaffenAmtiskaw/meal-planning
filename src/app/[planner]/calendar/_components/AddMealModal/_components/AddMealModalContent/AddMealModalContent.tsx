'use client';

import { Button, Modal, Stack } from '@mantine/core';

import { addMeal } from '@/_actions/calendar';
import type { MealInput } from '@/_actions/calendar/types';
import { useIsMobile, useSnackbar } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

import classes from './AddMealModalContent.module.css';

import {
	MealFormProvider,
	newMealValues,
	useMealForm,
} from '../../../_hooks/useMealForm';
import { MealDateSubtitle } from '../../../MealDateSubtitle/MealDateSubtitle';
import { MealForm } from '../../../MealForm';

type Props = {
	initialDate?: string;
	plannerId: string;
	close: () => void;
};

/**
 * What Add Meal shows while it's open: its header and the meal form. It mounts
 * on each open, so every open starts a fresh form from its own date, and the
 * header reads the picked date from that form.
 */
export function AddMealModalContent({ initialDate, plannerId, close }: Props) {
	const isMobile = useIsMobile();
	const { show } = useSnackbar();
	const form = useMealForm(newMealValues(initialDate));

	// The date that went to the server, so the message matches where the meal now shows.
	const handleSuccess = (saved: MealInput) => {
		close();
		show({
			message: `Added to ${formatDate(saved.date, 'shortWeekdayMonthDay')}`,
		});
	};

	return (
		<MealFormProvider form={form}>
			<Modal.Content className={classes.content}>
				{isMobile ? (
					<Modal.Header className={classes.phoneHeader}>
						<Button
							variant="subtle"
							px={0}
							justify="flex-start"
							onClick={close}
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
							<MealDateSubtitle date={form.values.date} />
						</Stack>
						<Modal.CloseButton aria-label="Close" />
					</Modal.Header>
				)}
				<Modal.Body className={classes.body} p={0}>
					<MealForm
						save={(input) => addMeal({ plannerId, ...input })}
						onSuccess={handleSuccess}
						onCancel={close}
					/>
				</Modal.Body>
			</Modal.Content>
		</MealFormProvider>
	);
}
