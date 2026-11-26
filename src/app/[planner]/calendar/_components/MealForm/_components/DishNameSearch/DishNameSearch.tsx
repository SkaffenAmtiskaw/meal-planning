'use client';

import { useEffect, useRef } from 'react';

import { TextInput } from '@mantine/core';

import { useDish } from '../../_hooks/useDish';

/**
 * The phone dish name field, which also searches saved recipes. Tapping it or
 * typing opens its row's list. Editing a linked dish's name unlinks it, since
 * it's now a different dish. When the list opens from elsewhere, such as Add
 * dish or the recipe chip, the cursor moves here, ready to search. A nameless
 * dish draws the field red; its row shows the message.
 */
export const DishNameSearch = () => {
	const { dish, nameless, listOpenId, renameDish, unlinkDish, openList } =
		useDish();
	const ref = useRef<HTMLInputElement>(null);
	const listOpen = listOpenId !== null;
	const linked = dish.source?.kind === 'saved';
	const openThisList = () => openList(dish.key);

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
			error={nameless}
			value={dish.name}
			onFocus={openThisList}
			onClick={openThisList}
			onChange={(e) => {
				renameDish(dish.key, e.currentTarget.value);
				if (linked) {
					unlinkDish(dish.key);
				}
				openThisList();
			}}
		/>
	);
};
