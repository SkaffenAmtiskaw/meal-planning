'use client';

import { TextInput } from '@mantine/core';

type Props = {
	name: string;
	onRename: (name: string) => void;
};

// The desktop dish name field. Renaming a dish never changes what it links to.
export const DishNameInput = ({ name, onRename }: Props) => (
	<TextInput
		aria-label="Dish name"
		placeholder="Dish name"
		flex={1}
		value={name}
		onChange={(e) => onRename(e.currentTarget.value)}
	/>
);
