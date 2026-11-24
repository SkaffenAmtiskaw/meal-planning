'use client';

import { TextInput } from '@mantine/core';

type Props = {
	name: string;
	// Draws the field red; its row shows the message.
	error?: boolean;
	onRename: (name: string) => void;
};

// The desktop dish name field. Renaming a dish never changes what it links to.
export const DishNameInput = ({ name, error = false, onRename }: Props) => (
	<TextInput
		aria-label="Dish name"
		placeholder="Dish name"
		flex={1}
		error={error}
		value={name}
		onChange={(e) => onRename(e.currentTarget.value)}
	/>
);
