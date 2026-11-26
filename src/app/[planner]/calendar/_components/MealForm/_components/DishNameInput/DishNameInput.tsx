'use client';

import { TextInput } from '@mantine/core';

import { useDish } from '../../_hooks/useDish';

/**
 * The desktop dish name field. Renaming a dish never changes what it links to.
 * A nameless dish draws the field red; its row shows the message.
 */
export const DishNameInput = () => {
	const { dish, nameless, renameDish } = useDish();

	return (
		<TextInput
			aria-label="Dish name"
			placeholder="Dish name"
			flex={1}
			error={nameless}
			value={dish.name}
			onChange={(e) => renameDish(dish.key, e.currentTarget.value)}
		/>
	);
};
