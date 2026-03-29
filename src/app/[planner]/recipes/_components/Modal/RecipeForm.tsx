'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
	Button,
	Fieldset,
	Grid,
	Group,
	NumberInput,
	SimpleGrid,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

import { zod4Resolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { addRecipe } from '@/_actions/saved/addRecipe';
import { editRecipe } from '@/_actions/saved/editRecipe';
import type { TagOption } from '@/_components';
import {
	FormFeedbackAlert,
	StringArrayInput,
	SubmitButton,
	TagCombobox,
} from '@/_components';
import { useFormFeedback } from '@/_hooks';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';

// Resolver only validates fields Mantine manages; ingredients/instructions/tags
// are controlled via useState and merged in handleSubmit.
// source.url uses z.string() (not z.url()) to allow empty strings — handleSubmit
// converts empty strings to undefined before saving.
const zFormFields = zRecipeFormSchema
	.omit({
		ingredients: true,
		instructions: true,
		tags: true,
		plannerId: true,
	})
	.extend({
		source: z
			.object({ name: z.string(), url: z.string().optional() })
			.optional(),
	});

type Props = {
	plannerId: string;
	item?: RecipeInterface;
	tags: TagOption[];
	redirectTo?: string;
};

export const RecipeForm = ({ item, plannerId, tags, redirectTo }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const destination = redirectTo ?? pathname;

	const [ingredients, setIngredients] = useState<string[]>(
		item?.ingredients ?? [],
	);
	const [instructions, setInstructions] = useState<string[]>(
		item?.instructions ?? [],
	);
	const [selectedTags, setSelectedTags] = useState<string[]>(
		item?.tags?.map(String) ?? [],
	);

	const { status, countdown, errorMessage, wrap } = useFormFeedback();

	const form = useForm({
		mode: 'uncontrolled',
		validate: zod4Resolver(zFormFields),
		initialValues: {
			name: item?.name ?? '',
			source: {
				name: item?.source?.name ?? '',
				url: item?.source?.url ?? '',
			},
			time: {
				prep: item?.time?.prep ?? '',
				cook: item?.time?.cook ?? '',
				total: item?.time?.total ?? '',
				actual: item?.time?.actual ?? '',
			},
			servings: item?.servings,
			notes: item?.notes ?? '',
			storage: item?.storage ?? '',
		},
	});

	const handleSubmit = form.onSubmit(
		wrap(
			async (values) => {
				const source = values.source?.name
					? { name: values.source.name, url: values.source.url || undefined }
					: undefined;

				const time =
					values.time && Object.values(values.time).some(Boolean)
						? {
								prep: values.time.prep || undefined,
								cook: values.time.cook || undefined,
								total: values.time.total || undefined,
								actual: values.time.actual || undefined,
							}
						: undefined;

				const payload = {
					...values,
					source,
					time,
					ingredients,
					instructions,
					tags: selectedTags,
					plannerId,
				};

				if (item) {
					return editRecipe({ ...payload, _id: String(item._id) });
				}

				return addRecipe(payload);
			},
			() => router.push(destination),
		),
	);

	return (
		<form onSubmit={handleSubmit} data-testid="recipe-form">
			<input
				style={{ display: 'none' }}
				name="plannerId"
				value={plannerId}
				readOnly
			/>
			<FormFeedbackAlert status={status} errorMessage={errorMessage} />
			<Grid>
				<Grid.Col span={12}>
					<TextInput
						label="Title"
						key={form.key('name')}
						withAsterisk
						{...form.getInputProps('name')}
					/>
				</Grid.Col>
				<Grid.Col span={5}>
					<Fieldset legend="Source">
						<SimpleGrid cols={2}>
							<TextInput
								label="Name"
								key={form.key('source.name')}
								{...form.getInputProps('source.name')}
							/>
							<TextInput
								label="URL"
								key={form.key('source.url')}
								{...form.getInputProps('source.url')}
							/>
						</SimpleGrid>
					</Fieldset>
				</Grid.Col>
				<Grid.Col span={7}>
					<Fieldset legend="Time">
						<SimpleGrid cols={4}>
							<TextInput
								label="Prep"
								key={form.key('time.prep')}
								{...form.getInputProps('time.prep')}
							/>
							<TextInput
								label="Cook"
								key={form.key('time.cook')}
								{...form.getInputProps('time.cook')}
							/>
							<TextInput
								label="Total"
								key={form.key('time.total')}
								{...form.getInputProps('time.total')}
							/>
							<TextInput
								label="Actual"
								key={form.key('time.actual')}
								{...form.getInputProps('time.actual')}
							/>
						</SimpleGrid>
					</Fieldset>
				</Grid.Col>
				<Grid.Col span={4}>
					<NumberInput
						label="Servings"
						min={0}
						{...form.getInputProps('servings')}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<StringArrayInput
						label="Ingredients"
						placeholder="e.g. 1 cup flour"
						value={ingredients}
						onChange={setIngredients}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<StringArrayInput
						label="Instructions"
						placeholder="e.g. Preheat oven to 350°F"
						value={instructions}
						onChange={setInstructions}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<Textarea
						label="Notes"
						key={form.key('notes')}
						{...form.getInputProps('notes')}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<Textarea
						label="Storage"
						key={form.key('storage')}
						{...form.getInputProps('storage')}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<TagCombobox
						label="Tags"
						plannerId={plannerId}
						initialTags={tags}
						value={selectedTags}
						onChange={setSelectedTags}
					/>
				</Grid.Col>
				<Grid.Col span={12}>
					<Group justify="flex-end">
						<Button variant="subtle" onClick={() => router.push(destination)}>
							Cancel
						</Button>
						<SubmitButton
							status={status}
							countdown={countdown}
							label={item ? 'Save' : 'Add Recipe'}
						/>
					</Group>
				</Grid.Col>
			</Grid>
		</form>
	);
};
