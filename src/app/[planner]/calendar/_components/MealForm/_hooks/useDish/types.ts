import type { SavedItem } from '@/_actions/library/types';

import type { OpenDishList } from '../useOpenDishList';
import type { DishDraft } from '../../types';

// What the meal form knows about its dishes, and its actions on them, each taking a dish's key.
export type MealDishes = {
	// The dishes whose rows show the nameless error.
	namelessKeys: ReadonlySet<string>;
	// The dish being linked to a saved recipe, if any.
	linkingKey: string | null;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	// The saved list open on a phone, if any.
	openDishList: OpenDishList | null;
	renameDish: (key: string, name: string) => void;
	removeDish: (key: string) => void;
	unlinkDish: (key: string) => void;
	setReference: (key: string, text: string) => void;
	setNote: (key: string, note: string) => void;
	startLinking: (key: string) => void;
	openList: (key: string) => void;
	closeList: () => void;
	// The phone list's Use: the dish takes the recipe's name and links to it.
	chooseRecipe: (key: string, item: SavedItem) => void;
};

// What useDish() gives a piece inside a dish row: its dish, that dish's flags, and the form's actions.
export type Dish = Omit<
	MealDishes,
	'namelessKeys' | 'linkingKey' | 'openDishList'
> & {
	dish: DishDraft;
	// True once a save was stopped because this dish has something in it but no name.
	nameless: boolean;
	// True while this dish is the one being linked to a saved recipe.
	linking: boolean;
	// The id of this open of the dish's saved list on a phone, or null while it's closed.
	listOpenId: number | null;
};
