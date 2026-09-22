'use client';

import { useEffect } from 'react';

import {
	Button,
	Card,
	Flex,
	Group,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';

import { DateTime } from 'luxon';
import { z } from 'zod';

import { addMeal } from '@/_actions/calendar';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback, useIsMobile } from '@/_hooks';

import { DishList } from './DishList';
import { MealFields } from './MealFields';
import { useDishes } from './useDishes';
import type { MealFormValues } from './types';
import classes from './AddMealForm.module.css';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';

const zFormFields = z.object({
	date: z.string().min(1, { error: 'Date is required' }),
	mealName: z.string().min(1, { error: 'Meal name is required' }),
	description: z.string().optional(),
});

const formatSubtitle = (values: Pick<MealFormValues, 'date' | 'mealName'>) => {
	const dateTime = DateTime.fromISO(values.date);
	const dateText = dateTime.isValid
		? dateTime.toFormat('cccc, LLLL d')
		: values.date || '';
	return values.mealName
		? `${dateText}${dateText ? ' · ' : ''}${values.mealName}`
		: dateText;
};

export type Props = {
	plannerId: string;
	initialDate?: string;
	onCancel: () => void;
	onSuccess?: (calendar: SerializedDay[]) => void;
	onSubtitleChange?: (subtitle: string) => void;
};

export const AddMealForm = ({
	plannerId,
	initialDate,
	onCancel,
	onSuccess,
	onSubtitleChange,
}: Props) => {
	const { dishes, addDish, removeDish, updateDish } = useDishes();
	const { status, countdown, errorMessage, wrap } = useFormFeedback();
	const isMobile = useIsMobile();

	const form = useForm<MealFormValues>({
		mode: 'uncontrolled',
		validate: schemaResolver(zFormFields),
		initialValues: {
			date: initialDate ?? '',
			mealName: '',
			description: '',
		},
		onValuesChange: (values) => {
			onSubtitleChange?.(formatSubtitle(values));
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only initial subtitle push
	useEffect(() => {
		onSubtitleChange?.(
			formatSubtitle({
				date: initialDate ?? '',
				mealName: '',
			}),
		);
	}, []);

	const handleSubmit = form.onSubmit(
		wrap(
			async (values) =>
				addMeal({
					...values,
					plannerId,
					dishes: dishes.map((d) => ({
						name: d.name,
						sourceType: d.sourceType,
						savedId: d.savedId || undefined,
						sourceText: d.sourceText || undefined,
						note: d.note || undefined,
					})),
				}),
			(data) => {
				onSuccess?.(data.calendar as SerializedDay[]);
			},
		),
	);

	const dishCountLabel = `${dishes.length} ${dishes.length === 1 ? 'dish' : 'dishes'} on this meal`;

	const dishListProps = {
		dishes,
		onAddDish: addDish,
		onRemoveDish: removeDish,
		onUpdateDish: updateDish,
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={classes.form}
			data-testid="add-meal-form"
		>
			<Stack gap="md" className={classes.stack}>
				<FormFeedbackAlert status={status} errorMessage={errorMessage} />

				{isMobile ? (
					<ScrollArea
						className={classes.scrollArea}
						data-testid="mobile-layout"
					>
						<Stack gap="md">
							<MealFields form={form} />
							<DishList {...dishListProps} />
						</Stack>
					</ScrollArea>
				) : (
					<Flex flex={1} mih={0} gap="md" data-testid="desktop-layout">
						<Flex
							flex="0 0 33.333%"
							mih={0}
							direction="column"
							className={classes.mealFieldsPane}
							data-testid="meal-fields-pane"
						>
							<MealFields form={form} />
						</Flex>
						<Flex
							flex={1}
							miw={0}
							mih={0}
							direction="column"
							className={classes.rightPane}
							data-testid="dish-list-pane"
						>
							<ScrollArea className={classes.scrollArea}>
								<DishList {...dishListProps} />
							</ScrollArea>
						</Flex>
					</Flex>
				)}

				<Card withBorder className={classes.footer} data-testid="footer">
					<Group justify="space-between" align="center">
						<Text size="sm" c="dimmed">
							{dishCountLabel}
						</Text>
						<Group>
							<Button variant="subtle" onClick={onCancel}>
								Cancel
							</Button>
							<SubmitButton
								status={status}
								countdown={countdown}
								label="Add Meal"
							/>
						</Group>
					</Group>
				</Card>
			</Stack>
		</form>
	);
};
