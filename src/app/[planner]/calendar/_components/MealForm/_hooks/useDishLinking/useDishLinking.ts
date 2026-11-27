'use client';

import { useRef } from 'react';

import type { SavedItem } from '@/_actions/library/types';
import { useIsMobile } from '@/_hooks';

import { useLinkMode } from '../useLinkMode';
import { useOpenDishList } from '../useOpenDishList';
import { useMealDishes } from '../../../_hooks/useMealForm';

/**
 * How a dish gets a saved recipe: link mode with the Saved recipes column on
 * desktop, or the dish's saved list under its name on a phone, and what each
 * does with the recipe picked.
 */
export const useDishLinking = () => {
	const { dishes, addDish, addLinkedDish, linkDish, chooseRecipe } =
		useMealDishes();
	const [linkingKey, { enterLinking, exitLinking }] = useLinkMode(dishes);
	const [openDishList, { openList, restartList, closeList }] =
		useOpenDishList();
	const searchRef = useRef<HTMLInputElement>(null);
	const isMobile = useIsMobile();

	/**
	 * Links a dish from the Saved recipes column, with the cursor in its search,
	 * which the column fills with the dish's name. A phone has no column, so it
	 * opens the dish's saved list instead, as a new open even if it's already
	 * open.
	 */
	const startLinking = (key: string) => {
		if (isMobile) {
			restartList(key);
			return;
		}
		enterLinking(key);
		searchRef.current?.focus();
	};

	// On a phone, a new dish opens its saved list, so a saved recipe is the first thing offered.
	const addDishWithList = () => {
		const key = addDish();
		if (isMobile) {
			openList(key);
		}
	};

	// The phone list's Use: the dish takes the recipe, and its list closes.
	const chooseFromList = (key: string, item: SavedItem) => {
		chooseRecipe(key, item);
		closeList();
	};

	// The column's action: links the recipe to the dish being linked, or adds it as a new dish.
	const pickSavedItem = (item: SavedItem) => {
		if (linkingKey === null) {
			addLinkedDish(item);
			return;
		}
		linkDish(linkingKey, item);
		exitLinking();
	};

	return {
		linkingKey,
		linkingDish: dishes.find((dish) => dish.key === linkingKey) ?? null,
		openDishList,
		searchRef,
		startLinking,
		addDishWithList,
		chooseFromList,
		pickSavedItem,
		openList,
		closeList,
		exitLinking,
	};
};

export type DishLinking = ReturnType<typeof useDishLinking>;
