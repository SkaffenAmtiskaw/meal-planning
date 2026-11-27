'use client';

import { Stack, Textarea, TextInput } from '@mantine/core';

import classes from './MealFields.module.css';

import { useMealFormContext } from '../../../_hooks/useMealForm';
import { MealDateField } from '../MealDateField/MealDateField';

/**
 * The meal's Date, Meal name and Description, bound to the meal form. The E2E
 * helpers find each field by its label. Description fills whatever height its
 * parent gives it: the rest of the Meal column on desktop, and 3 rows in a
 * phone's card.
 */
export const MealFields = () => {
	const form = useMealFormContext();

	return (
		<Stack gap="sm" className={classes.fill}>
			<MealDateField
				value={form.values.date}
				onChange={(date) => form.setFieldValue('date', date)}
			/>
			<TextInput
				label="Meal name"
				withAsterisk
				{...form.getInputProps('mealName')}
			/>
			<Textarea
				label="Description"
				placeholder="Optional"
				rows={3}
				classNames={{
					root: classes.descriptionRoot,
					wrapper: classes.descriptionWrapper,
					input: classes.descriptionInput,
				}}
				{...form.getInputProps('description')}
			/>
		</Stack>
	);
};
