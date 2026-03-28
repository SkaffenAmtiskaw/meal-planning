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

import { zodResolver } from 'mantine-form-zod-resolver';

import { addRecipe } from '@/_actions/saved/addRecipe';
import type { TagOption } from '@/_components';
import { StringArrayInput, TagCombobox } from '@/_components';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';

type Props = {
	plannerId: string;
	item?: RecipeInterface;
	tags: TagOption[];
};

export const RecipeForm = ({ item, plannerId, tags }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	const [ingredients, setIngredients] = useState<string[]>(
		item?.ingredients ?? [],
	);
	const [instructions, setInstructions] = useState<string[]>(
		item?.instructions ?? [],
	);
	const [selectedTags, setSelectedTags] = useState<string[]>(
		item?.tags?.map(String) ?? [],
	);

	const form = useForm({
		mode: 'uncontrolled',
		validate: zodResolver(zRecipeFormSchema),
	});

	// TODO: implement editRecipe for edit flow
	const handleSubmit = form.onSubmit(async (values) => {
		await addRecipe({
			...values,
			ingredients,
			instructions,
			tags: selectedTags,
			plannerId,
		});
		router.push(pathname);
	});

	return (
		<form onSubmit={handleSubmit} data-testid="recipe-form">
			<input
				style={{ display: 'none' }}
				name="plannerId"
				value={plannerId}
				readOnly
			/>
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
						<Button variant="subtle" onClick={() => router.push(pathname)}>
							Cancel
						</Button>
						<Button type="submit">{item ? 'Save' : 'Add Recipe'}</Button>
					</Group>
				</Grid.Col>
			</Grid>
		</form>
	);
};
