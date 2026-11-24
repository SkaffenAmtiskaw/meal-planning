'use client';

import { Button } from '@mantine/core';

type Props = {
	itemName: string;
	// The recipe is already on the meal, so the action does nothing.
	added: boolean;
	// A dish is being linked, so the action links the recipe to it rather than adding a dish.
	linking: boolean;
	onPick: () => void;
};

/**
 * A saved recipe's action: Add, a filled Link while a dish is being linked, or a
 * muted "Added" for a recipe already on the meal. "Added" can still be reached
 * with Tab, so it's a button that does nothing rather than a disabled one. Each
 * names its recipe, since every row has one.
 */
export const SavedItemAction = ({
	itemName,
	added,
	linking,
	onPick,
}: Props) => {
	if (added) {
		return (
			<Button
				variant="muted"
				size="compact-sm"
				radius="xl"
				aria-disabled
				aria-label={`${itemName}, added`}
			>
				Added
			</Button>
		);
	}

	return linking ? (
		<Button
			size="compact-sm"
			radius="xl"
			aria-label={`Link ${itemName}`}
			onClick={onPick}
		>
			Link
		</Button>
	) : (
		<Button
			variant="white-outline"
			size="compact-sm"
			radius="xl"
			aria-label={`Add ${itemName}`}
			onClick={onPick}
		>
			Add
		</Button>
	);
};
