'use client';

import { useEffect, useRef } from 'react';

import { TextInput } from '@mantine/core';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';
import { useDishLinkingContext } from '../../_hooks/useDishLinking';

/**
 * The phone dish name field, which also searches saved recipes. Tapping it or
 * typing opens its row's list. Editing a linked dish's name unlinks it, since
 * it's now a different dish. When the list opens from elsewhere, such as Add
 * dish or the recipe chip, the cursor moves here, ready to search. A nameless
 * dish draws the field red; its row shows the message.
 */
export const DishNameSearch = () => {
	const { dish, nameError } = useDish();
	const { renameAndUnlinkDish } = useMealDishes();
	const { openDishList, openList } = useDishLinkingContext();
	const ref = useRef<HTMLInputElement>(null);
	const listOpen = openDishList?.key === dish.key;
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
			error={nameError !== null}
			value={dish.name}
			onFocus={openThisList}
			onClick={openThisList}
			onChange={(e) => {
				renameAndUnlinkDish(dish.key, e.currentTarget.value);
				openThisList();
			}}
		/>
	);
};
