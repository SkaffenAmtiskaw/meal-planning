'use client';

import { Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';

import { z } from 'zod';

import { addMeal } from '@/_actions/planner/addMeal';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback } from '@/_hooks';

import { DishRow } from './DishRow';
import { useDishes } from './useDishes';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';

const zFormFields = z.object({
	date: z.string().min(1, 'Date is required'),
	mealName: z.string().min(1, 'Meal name is required'),
	description: z.string().optional(),
});

type Props = {
	plannerId: string;
	onClose: () => void;
	onMealAdded?: (calendar: SerializedDay[]) => void;
};

export const AddMealForm = ({ plannerId, onClose, onMealAdded }: Props) => {
	const { dishes, addDish, removeDish, updateDish } = useDishes();

	const { status, countdown, errorMessage, wrap } = useFormFeedback();

	const form = useForm({
		mode: 'uncontrolled',
		validate: schemaResolver(zFormFields),
		initialValues: { date: '', mealName: '', description: '' },
	});

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
				onMealAdded?.(data.calendar as SerializedDay[]);
				onClose();
			},
		),
	);

	return (
		<form onSubmit={handleSubmit} data-testid="add-meal-form">
			<Stack>
				<FormFeedbackAlert status={status} errorMessage={errorMessage} />
				<TextInput
					label="Date"
					type="date"
					withAsterisk
					data-testid="meal-date"
					key={form.key('date')}
					{...form.getInputProps('date')}
				/>
				<TextInput
					label="Meal name"
					withAsterisk
					data-testid="meal-name"
					key={form.key('mealName')}
					{...form.getInputProps('mealName')}
				/>
				<Textarea
					label="Description"
					data-testid="meal-description"
					key={form.key('description')}
					{...form.getInputProps('description')}
				/>

				<Stack gap="xs">
					<Text fw={500} size="sm">
						Dishes
					</Text>
					{dishes.map((dish, index) => (
						<DishRow
							key={dish.id}
							dish={dish}
							index={index}
							showRemove={dishes.length > 1}
							onUpdate={(patch) => updateDish(dish.id, patch)}
							onRemove={() => removeDish(dish.id)}
						/>
					))}

					<Button
						variant="subtle"
						leftSection={<IconPlus size={14} />}
						data-testid="add-dish-button"
						onClick={addDish}
					>
						Add dish
					</Button>
				</Stack>

				<Group justify="flex-end">
					<Button variant="subtle" onClick={onClose}>
						Cancel
					</Button>
					<SubmitButton
						status={status}
						countdown={countdown}
						label="Add Meal"
					/>
				</Group>
			</Stack>
		</form>
	);
};
