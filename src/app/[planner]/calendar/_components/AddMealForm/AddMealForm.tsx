'use client';

import { useState } from 'react';

import {
	Button,
	Fieldset,
	Group,
	Input,
	SegmentedControl,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { z } from 'zod';

import { addMeal } from '@/_actions/planner/addMeal';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback } from '@/_hooks';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
import type { SerializedDay } from '../../_utils/toScheduleXEvents';

type SourceType = 'none' | 'saved' | 'text';

type DishState = {
	id: string;
	name: string;
	sourceType: SourceType;
	savedId: string;
	sourceText: string;
	note: string;
	noteExpanded: boolean;
};

const makeDish = (): DishState => ({
	id: crypto.randomUUID(),
	name: '',
	sourceType: 'none',
	savedId: '',
	sourceText: '',
	note: '',
	noteExpanded: false,
});

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
	const savedItems = usePlannerSavedItems();

	const [dishes, setDishes] = useState<DishState[]>([makeDish()]);

	const { status, countdown, errorMessage, wrap } = useFormFeedback();

	const form = useForm({
		mode: 'uncontrolled',
		validate: schemaResolver(zFormFields),
		initialValues: { date: '', mealName: '', description: '' },
	});

	const updateDish = (id: string, patch: Partial<DishState>) => {
		setDishes((prev) =>
			prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
		);
	};

	const addDish = () => setDishes((prev) => [...prev, makeDish()]);

	const removeDish = (id: string) =>
		setDishes((prev) => prev.filter((d) => d.id !== id));

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
						<Fieldset key={dish.id} data-testid={`dish-row-${index}`}>
							<Stack gap="xs">
								<Group align="flex-end">
									<TextInput
										label="Dish name"
										style={{ flex: 1 }}
										data-testid={`dish-name-${index}`}
										value={dish.name}
										onChange={(e) =>
											updateDish(dish.id, { name: e.currentTarget.value })
										}
									/>
									{dishes.length > 1 && (
										<Button
											variant="subtle"
											color="red"
											size="compact-sm"
											data-testid={`dish-remove-${index}`}
											onClick={() => removeDish(dish.id)}
										>
											<IconTrash size={16} />
										</Button>
									)}
								</Group>

								<Stack gap={4}>
									<Input.Label>Source</Input.Label>
									<SegmentedControl
										data-testid={`dish-source-type-${index}`}
										value={dish.sourceType}
										onChange={(value) =>
											updateDish(dish.id, { sourceType: value as SourceType })
										}
										data={[
											{ label: 'None', value: 'none' },
											{ label: 'Saved', value: 'saved' },
											{ label: 'Reference', value: 'text' },
										]}
									/>
								</Stack>

								{dish.sourceType === 'saved' && (
									<Select
										label="Saved recipe / bookmark"
										data-testid={`dish-saved-${index}`}
										searchable
										data={savedItems.map((item) => ({
											value: item._id,
											label: item.name,
										}))}
										value={dish.savedId || null}
										onChange={(value) =>
											updateDish(dish.id, { savedId: value ?? '' })
										}
									/>
								)}

								{dish.sourceType === 'text' && (
									<TextInput
										label="URL or reference"
										data-testid={`dish-source-text-${index}`}
										value={dish.sourceText}
										onChange={(e) =>
											updateDish(dish.id, {
												sourceText: e.currentTarget.value,
											})
										}
									/>
								)}

								<Button
									variant="subtle"
									size="compact-xs"
									mt="xs"
									data-testid={`dish-note-toggle-${index}`}
									onClick={() =>
										updateDish(dish.id, {
											noteExpanded: !dish.noteExpanded,
											...(dish.noteExpanded && { note: '' }),
										})
									}
								>
									{dish.noteExpanded ? 'Remove note' : 'Add note'}
								</Button>

								{dish.noteExpanded && (
									<Textarea
										label="Note"
										data-testid={`dish-note-${index}`}
										value={dish.note}
										onChange={(e) =>
											updateDish(dish.id, { note: e.currentTarget.value })
										}
									/>
								)}
							</Stack>
						</Fieldset>
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
