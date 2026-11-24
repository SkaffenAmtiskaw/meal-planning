'use client';

import { Stack, Textarea, TextInput } from '@mantine/core';

import classes from './MealFields.module.css';

import type { MealDraft, MealField } from '../../types';

type Props = {
	values: Pick<MealDraft, MealField>;
	onFieldChange: (field: MealField, value: string) => void;
};

/**
 * The meal's Date, Meal name and Description. The E2E helpers find each field by
 * its label. Description fills whatever height its parent gives it: the rest of
 * the Meal column on desktop, and 3 rows in a phone's card.
 */
export const MealFields = ({ values, onFieldChange }: Props) => (
	<Stack gap="sm" className={classes.fill}>
		<TextInput
			label="Date"
			type="date"
			withAsterisk
			value={values.date}
			onChange={(e) => onFieldChange('date', e.currentTarget.value)}
		/>
		<TextInput
			label="Meal name"
			withAsterisk
			value={values.mealName}
			onChange={(e) => onFieldChange('mealName', e.currentTarget.value)}
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
			value={values.description}
			onChange={(e) => onFieldChange('description', e.currentTarget.value)}
		/>
	</Stack>
);
