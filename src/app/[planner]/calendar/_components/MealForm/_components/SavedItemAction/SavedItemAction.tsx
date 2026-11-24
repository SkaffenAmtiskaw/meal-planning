'use client';

import { Button } from '@mantine/core';

type Props = {
	itemName: string;
	// The recipe is already on the meal, so the action does nothing.
	added: boolean;
	onAdd: () => void;
};

/**
 * A saved recipe's action: Add, or a muted "Added" for a recipe already on the
 * meal. "Added" can still be reached with Tab, so it's a button that does
 * nothing rather than a disabled one. Each names its recipe, since every row
 * has one.
 */
export const SavedItemAction = ({ itemName, added, onAdd }: Props) =>
	added ? (
		<Button
			variant="muted"
			size="compact-sm"
			radius="xl"
			aria-disabled
			aria-label={`${itemName}, added`}
		>
			Added
		</Button>
	) : (
		<Button
			variant="white-outline"
			size="compact-sm"
			radius="xl"
			aria-label={`Add ${itemName}`}
			onClick={onAdd}
		>
			Add
		</Button>
	);
