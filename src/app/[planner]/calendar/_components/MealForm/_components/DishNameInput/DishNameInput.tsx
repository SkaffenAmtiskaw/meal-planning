'use client';

import { TextInput } from '@mantine/core';

import { useMealFormContext } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';

/**
 * The desktop dish name field, bound to the form, since renaming a dish never
 * changes what it links to. A nameless dish draws the field red; its row shows
 * the message, so the field shows none of its own.
 */
export const DishNameInput = () => {
	const { index, nameError } = useDish();
	const form = useMealFormContext();

	return (
		<TextInput
			aria-label="Dish name"
			placeholder="Dish name"
			flex={1}
			{...form.getInputProps(`dishes.${index}.name`, { withError: false })}
			error={nameError !== null}
		/>
	);
};
