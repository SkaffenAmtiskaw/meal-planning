'use client';

import { useEffect, useRef } from 'react';

import { TextInput } from '@mantine/core';

type Props = {
	name: string;
	// Draws the field red; its row shows the message.
	error?: boolean;
	// True while a saved recipe is linked to the dish.
	linked: boolean;
	// True while this dish's saved list is open.
	listOpen: boolean;
	onRename: (name: string) => void;
	onUnlink: () => void;
	onOpenList: () => void;
};

/**
 * The phone dish name field, which also searches saved recipes. Tapping it or
 * typing opens its row's list. Editing a linked dish's name unlinks it, since
 * it's now a different dish. When the list opens from elsewhere, such as Add
 * dish or the recipe chip, the cursor moves here, ready to search.
 */
export const DishNameSearch = ({
	name,
	error = false,
	linked,
	listOpen,
	onRename,
	onUnlink,
	onOpenList,
}: Props) => {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (listOpen) {
			ref.current?.focus();
		}
	}, [listOpen]);

	return (
		<TextInput
			ref={ref}
			aria-label="Dish name"
			placeholder="Dish name or search saved recipes"
			flex={1}
			error={error}
			value={name}
			onFocus={onOpenList}
			onClick={onOpenList}
			onChange={(e) => {
				onRename(e.currentTarget.value);
				if (linked) {
					onUnlink();
				}
				onOpenList();
			}}
		/>
	);
};
