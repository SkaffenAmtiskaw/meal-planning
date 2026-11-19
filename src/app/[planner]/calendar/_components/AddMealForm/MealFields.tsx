import { Card, Stack, Text, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

import type { MealFormValues } from './types';

type MealFieldsProps = {
	form: Pick<UseFormReturnType<MealFormValues>, 'key' | 'getInputProps'>;
};

export const MealFields = ({ form }: MealFieldsProps) => (
	<Card bg="chalk.0" p="sm">
		<Stack gap="xs">
			<Text fw={500} size="sm" c="dimmed">
				MEAL
			</Text>
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
		</Stack>
	</Card>
);
